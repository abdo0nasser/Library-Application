import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

@Module({
  providers: [UserService, AuthService, PrismaService],
  controllers: [UserController, AuthController],
})
export class UserModule {}
