import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { FacebookStrategy } from './auth/passport-strategies/facebook.strategy';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emails',
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      },
    }),
  ],
  providers: [UserService, AuthService, FacebookStrategy],
  controllers: [UserController, AuthController],
})
export class UserModule {}
