import { Module } from '@nestjs/common';
import { EmailConsumer } from './worker.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UserModule, MailModule],
  providers: [EmailConsumer],
})
export class WorkerModule {}
