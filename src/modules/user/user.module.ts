import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { MailModule } from '../mail/mail.module';
import { FacebookStrategy } from './auth/passport-strategies/facebook.strategy';

@Module({
  imports: [MailModule],
  providers: [UserService, AuthService, FacebookStrategy],
  controllers: [UserController, AuthController],
})
export class UserModule {}
