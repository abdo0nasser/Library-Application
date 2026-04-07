import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookModule } from './modules/book/book.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { MailModule } from './modules/mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { BullModule } from '@nestjs/bullmq';
import { WorkerModule } from './modules/worker/worker.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: seconds(config.get<number>('THROTTLE_TTL', 60)),
            limit: config.get<number>('THROTTLE_LIMIT', 30),
          },
        ],
        storage: new ThrottlerStorageRedisService(
          config.get<string>('REDIS_THROTTLER'),
        ),
      }),
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
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          connection: {
            host: config.get<string>('BULLMQ_HOST'),
            port: config.get<number>('BULLMQ_PORT'),
          },
          defaultJobOptions: {
            attempts: 3,
          },
        };
      },
    }),
    BookModule,
    MailModule,
    WorkerModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
