import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer-config';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import type { JwtPayloadType } from 'src/utils/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('signup')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const profilePicPath = file?.path ?? null;
    return await this.authService.createUser(createUserDto, profilePicPath);
  }

  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  async sendVerification(@CurrentUser() user: JwtPayloadType) {
    return await this.authService.sendVerification(user);
  }

  @Public()
  @Get('verify-email/:id')
  async verifyEmail(
    @Param('id', ParseIntPipe) userId: number,
    @Query('verification-code') verificationCode: string,
  ) {
    return await this.authService.verifyEmail(userId, verificationCode);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
