import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('APP_ID'),
      clientSecret: configService.get<string>('APP_SECRET'),
      callbackURL: `${configService.get<string>('DOMAIN')}/api/auth/facebook-redirect`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, id } = profile;
    const email = emails?.[0]?.value;
    if (!email) return done(new Error('No email returned from Facebook'), null);

    const user = {
      id,
      email,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
    };

    done(null, user);
  }
}
