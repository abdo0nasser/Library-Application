import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
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
import type { JwtPayloadType, FacebookUser } from 'src/utils/types';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

type AuthenticatedRequest = Request & { user?: FacebookUser };

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async loginUser(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.tokenCookie(result.accessToken, res);

    const { accessToken, ...rest } = result;
    return Object.keys(rest).length ? rest : undefined;
  }

  @Public()
  @Get('facebook-login')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Login user with facebook account' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  facebookLogin(): void {}

  @Public()
  @Get('facebook-redirect')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback redirect' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend with JWT set in HTTP-only cookie',
  })
  async facebookRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const user = req.user as FacebookUser;
    if (!user) return res.redirect(`${frontendUrl}/login?error=auth_failed`);

    const result = await this.authService.facebookAuth(user);
    this.tokenCookie(result.accessToken, res);
    return res.redirect(`${frontendUrl}/auth/facebook/callback`);
  }

  @Public()
  @Post('signup')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create new user account' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const profilePicPath = file?.path ?? null;
    const result = await this.authService.createUser(
      createUserDto,
      profilePicPath,
    );
    this.tokenCookie(result.accessToken, res);

    const { accessToken, ...rest } = result;
    return rest;
  }

  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Send verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerification(@CurrentUser() user: JwtPayloadType) {
    return await this.authService.sendVerification(user);
  }

  @Public()
  @Get('verify-email/:id')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(
    @Param('id', ParseIntPipe) userId: number,
    @Query('verification-code') verificationCode: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(userId, verificationCode);
    this.tokenCookie(result.accessToken, res);

    const { accessToken, ...userData } = result;
    return userData;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successful logout' })
  async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['access_token'];
    res.clearCookie('access_token', this.cookieOptions);
    return await this.authService.logout(token);
  }

  private get cookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }

  private tokenCookie(token: string, @Res() res: Response) {
    res.cookie('access_token', token, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
