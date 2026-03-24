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
import { JwtPayloadType } from 'src/utils/types';
import { unlink } from 'fs/promises';
import { MailService } from 'src/modules/mail/mail.service';
import { randomBytes } from 'crypto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    profilePath: string | null,
  ): Promise<{ accessToken: string; message: string }> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      if (profilePath) {
        await unlink(profilePath).catch((err) =>
          console.error(`Failed to delete orphaned image: ${profilePath}`, err),
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
      if (profilePath) {
        await unlink(profilePath).catch((err) =>
          console.error(`Failed to delete orphaned image: ${profilePath}`, err),
        );
      }
      const message = e instanceof Error ? e.message : 'Failed to create user';
      throw new BadRequestException(message);
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
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

    // checking user data
    if (!user || !(await verify(loginDto.password, user.password)))
      throw new UnauthorizedException('invalid email or password');

    if (!user.email_verified_at)
      throw new UnauthorizedException(
        'Please verify your email prior to login',
      );

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.user_role,
      isVerified: user.email_verified_at ? true : false,
    });

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

    try {
      await this.mailService.sendVerificationMail(
        user.sub,
        user.email,
        verificationCode,
      );
    } catch {
      await this.cache.del(String(user.sub));
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification mail has been sent' };
  }

  async verifyEmail(id: number, verificationCode: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user?.email_verified_at)
      throw new BadRequestException('User already verified');

    const verificationCodeInCache = await this.cache.get<string>(String(id));
    // check if there's an existing verifcation code in cache and whether it's the same as the code sent
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

      return {
        data: { user: user, accessToken },
        message: 'User has been verified',
      };
    } catch {
      throw new BadRequestException('Failed to update verification status');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const verificationCode = randomBytes(32).toString('hex');
    await this.cache.set(
      `reset-${user.email}`,
      verificationCode,
      this.configService.get<number>('REDIS_TTL'),
    );

    try {
      await this.mailService.sendResetPasswordMail(
        user.email,
        verificationCode,
      );
    } catch {
      await this.cache.del(`reset-${user.email}`);
      throw new BadRequestException('Failed to send reset password email');
    }

    return { message: 'Password reset email has been sent' };
  }

  async resetPassword(resetDto: {
    email: string;
    token: string;
    newPassword: string;
  }) {
    const { email, token, newPassword } = resetDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const tokenInCache = await this.cache.get<string>(`reset-${email}`);
    if (!tokenInCache || tokenInCache !== token) {
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
      return { message: 'Password has been successfully reset' };
    } catch {
      throw new BadRequestException('Failed to reset password');
    }
  }

  private async generateAccessToken(payload: JwtPayloadType): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }
}
