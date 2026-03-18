import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookModule } from './modules/book/book.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { MailModule } from './modules/mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('JWT_EXPIRATION_TIME'),
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          stores: [new KeyvRedis(config.get<string>('REDIS_URL'))],
        };
      },
    }),

    BookModule,
    MailModule,
  ],
  controllers: [],
  providers: [PrismaService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
