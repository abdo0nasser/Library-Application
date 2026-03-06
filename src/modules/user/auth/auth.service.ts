import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, verify } from 'src/utils/argon';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenType } from 'src/utils/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    createUserDto.password = await hash(createUserDto.password);
    const user = await this.prismaService.user.create({ data: createUserDto });
    if (!user) throw new BadRequestException();

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prismaService.user.findFirst({
      where: { email: loginDto.email },
      select: { id: true, email: true, password: true },
    });

    // checking user data
    if (!user) throw new BadRequestException('no user with this email`');
    if (!(await verify(loginDto.password, user.password)))
      throw new BadRequestException('password is incorrect');

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  private async generateAccessToken(
    payload: JwtAccessTokenType,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }
}
