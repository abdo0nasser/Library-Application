import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
