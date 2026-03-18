import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendLoginMail(email: string) {
    try {
      const today = new Date();
      return await this.mailerService.sendMail({
        to: email,
        from: `<no-reply@my-nestjs-app.com>`,
        subject: `Login in our website`,
        html: `
        <div>
          <h2> Hi ${email} </h2>
          <p>you have logged in to your account on ${today.toDateString()} at ${today.toLocaleTimeString()} </p>
        </div>
        `,
      });
    } catch (err) {
      throw new BadRequestException('something went wrong ' + err);
    }
  }

  async sendVerificationMail(
    id: number,
    email: string,
    verificationCode: string,
  ) {
    try {
      const verificationLink = `${this.configService.get<string>('DOMAIN')}/api/auth/verify-email/${id}?verification-code=${verificationCode}`;
      return await this.mailerService.sendMail({
        to: email,
        from: `<no-reply@my-nestjs-app.com>`,
        subject: `Verify your email`,
        html: `
        <div>
          <h2> Hi ${email} </h2>
          <p>Verify to your account by pressing this link</p>
          <a href="${verificationLink}">Click Here</a> 
        </div>
        `,
      });
    } catch (err) {
      throw new BadRequestException('something went wrong ' + err);
    }
  }
}
