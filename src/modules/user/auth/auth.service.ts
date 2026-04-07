import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, verify } from 'src/utils/argon';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EMAIL_JOB_NAMES, FacebookUser, JwtPayloadType } from 'src/utils/types';
import { unlink } from 'fs/promises';
import { randomBytes } from 'crypto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectQueue('emails') private readonly emailsQueue: Queue,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async createUser(createUserDto: CreateUserDto, profilePath: string | null) {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      this.logger.warn(
        `Signup attempt with existing email: ${createUserDto.email}`,
      );
      if (profilePath) {
        await unlink(profilePath).catch((err) =>
          this.logger.error(
            `Failed to delete orphaned image: ${profilePath}`,
            err,
          ),
        );
      }
      throw new BadRequestException('User with this email already exists');
    }

    try {
      const hashedPassword = await hash(createUserDto.password);
      const user = await this.prismaService.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          user_profile: profilePath,
        },
      });

      this.logger.log(
        `User created successfully: id=${user.id}, email=${user.email}`,
      );

      const tokenPayload: JwtPayloadType = {
        sub: user.id,
        email: user.email,
        role: user.user_role,
        isVerified: false,
      };
      const accessToken = await this.generateAccessToken(tokenPayload);

      await this.sendVerification(tokenPayload);

      return {
        accessToken,
        message: 'Verify your email from the email sent to you',
      };
    } catch (e: unknown) {
      this.logger.error(
        `Failed to create user: ${createUserDto.email}`,
        e instanceof Error ? e.stack : String(e),
      );
      if (profilePath) {
        await unlink(profilePath).catch((err) =>
          this.logger.error(
            `Failed to delete orphaned image: ${profilePath}`,
            err,
          ),
        );
      }
      const message = e instanceof Error ? e.message : 'Failed to create user';
      throw new BadRequestException(message);
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        user_role: true,
        email_verified_at: true,
      },
    });

    if (!user || !(await verify(loginDto.password, user.password))) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
      throw new UnauthorizedException('invalid email or password');
    }

    if (!user.email_verified_at) {
      this.logger.warn(`Unverified login attempt for email: ${loginDto.email}`);
      throw new UnauthorizedException(
        'Please verify your email prior to login',
      );
    }

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.user_role,
      isVerified: user.email_verified_at ? true : false,
    });

    this.logger.log(`Login successful for user: id=${user.id}`);
    return { accessToken };
  }

  async sendVerification(user: JwtPayloadType) {
    if (user.isVerified)
      throw new BadRequestException('User is already verified');

    if (await this.cache.get<string>(String(user.sub)))
      throw new BadRequestException(
        'User has an active verification code wait until it ends',
      );

    const verificationCode = randomBytes(32).toString('hex');

    await this.cache.set(
      String(user.sub),
      verificationCode,
      this.configService.get<number>('REDIS_TTL'),
    );

    await this.emailsQueue.add(EMAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL, {
      userId: user.sub,
      email: user.email,
      code: verificationCode,
    });

    return { message: 'Verification email has been queued.' };
  }

  async verifyEmail(id: number, verificationCode: string) {
    this.logger.log(`Verifying email for user: id=${id}`);
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user?.email_verified_at)
      throw new BadRequestException('User already verified');

    const verificationCodeInCache = await this.cache.get<string>(String(id));
    if (
      !verificationCodeInCache ||
      verificationCodeInCache !== verificationCode
    )
      throw new BadRequestException(
        'Invalid or expired verification code. Please request a new one.',
      );
    try {
      await this.prismaService.user.update({
        where: { id },
        data: { email_verified_at: new Date() },
        omit: { password: true },
      });
      await this.cache.del(String(id));
      const accessToken = await this.generateAccessToken({
        sub: id,
        email: user.email,
        role: user.user_role,
        isVerified: true,
      });

      this.logger.log(`Email verified for user: id=${id}`);
      return { user, accessToken };
    } catch {
      this.logger.error(
        `Failed to update verification status for user: id=${id}`,
      );
      throw new BadRequestException('Failed to update verification status');
    }
  }

  async forgotPassword(email: string) {
    this.logger.log(`Password reset requested for email: ${email}`);
    const user = await this.prismaService.user.findUnique({
      where: { email },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const tokenInCache = await this.cache.get<string>(`reset-${email}`);
    if (tokenInCache) {
      throw new BadRequestException(
        'An active password reset code already exists for this email. Please wait until it expires.',
      );
    }

    const verificationCode = randomBytes(32).toString('hex');

    await this.cache.set(
      `reset-${email}`,
      verificationCode,
      this.configService.get<number>('REDIS_TTL'),
    );

    await this.emailsQueue.add(EMAIL_JOB_NAMES.SEND_RESET_PASSWORD_EMAIL, {
      email: user.email,
      code: verificationCode,
    });

    return { message: 'Reset password email has been queued.' };
  }

  async resetPassword(resetDto: {
    email: string;
    token: string;
    newPassword: string;
  }) {
    const { email, token, newPassword } = resetDto;
    this.logger.log(`Processing password reset for email: ${email}`);

    const user = await this.prismaService.user.findUnique({
      where: { email },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const tokenInCache = await this.cache.get<string>(`reset-${email}`);
    if (!tokenInCache || tokenInCache !== token) {
      this.logger.warn(`Invalid or expired reset token for email: ${email}`);
      throw new BadRequestException(
        'Invalid or expired reset token. Please request a new one.',
      );
    }

    const hashedPassword = await hash(newPassword);

    try {
      await this.prismaService.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      await this.cache.del(`reset-${email}`);
      this.logger.log(`Password reset successful for email: ${email}`);
      return { message: 'Password has been successfully reset' };
    } catch {
      this.logger.error(`Failed to reset password for email: ${email}`);
      throw new BadRequestException('Failed to reset password');
    }
  }

  async facebookAuth(facebookAuthData: FacebookUser) {
    this.logger.log(
      `Facebook auth attempt for email: ${facebookAuthData.email}`,
    );

    let user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          { facebook_id: facebookAuthData.id },
          { email: facebookAuthData.email },
        ],
      },
    });

    if (!user) {
      const randomPassword = randomBytes(32).toString('hex');
      user = await this.prismaService.user.create({
        data: {
          facebook_id: facebookAuthData.id,
          email: facebookAuthData.email,
          name: `${facebookAuthData.firstName} ${facebookAuthData.lastName}`.trim(),
          age: null,
          password: await hash(randomPassword),
          email_verified_at: new Date(),
        },
      });
      this.logger.log(
        `New user created via Facebook: id=${user.id}, email=${user.email}`,
      );
    } else if (!user.facebook_id) {
      // Link the facebook account if not linked
      user = await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          facebook_id: facebookAuthData.id,
          email_verified_at: user.email_verified_at || new Date(),
        },
      });
      this.logger.log(
        `Linked Facebook account to existing user: id=${user.id}`,
      );
    }
    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.user_role,
      isVerified: true,
    });

    this.logger.log(`Facebook login successful for user: id=${user.id}`);
    return { accessToken };
  }

  async logout(token: string) {
    const decodedToken = this.jwtService.decode(token);
    const now = Date.now() / 1000;
    const secondsLeft = decodedToken.exp - now;

    if (secondsLeft > 0) {
      await this.cache.set(
        `blacklist:${token}`,
        'true',
        Math.ceil(secondsLeft * 1000),
      );
    } else throw new BadRequestException('Incorrect token');

    return { message: 'Token has been successfully blacklisted' };
  }

  private async generateAccessToken(payload: JwtPayloadType): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }
}
