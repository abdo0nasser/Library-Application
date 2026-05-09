import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { EMAIL_JOB_NAMES, SendMailData } from 'src/utils/types';
import { Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Processor('emails', { concurrency: 3 })
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly logger: AppLoggerService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super();
    logger.setContext(EmailConsumer.name);
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job: ${job.name}, id: ${job.id}`);

    switch (job.name) {
      case EMAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL:
        return await this.handleVerificationEmail(job.data as SendMailData);

      case EMAIL_JOB_NAMES.SEND_RESET_PASSWORD_EMAIL:
        return await this.handleResetPasswordEmail(
          job.data as Omit<SendMailData, 'userId'>,
        );

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        return;
    }
  }

  private async handleVerificationEmail(data: SendMailData) {
    await this.mailService.sendVerificationMail(
      data.userId,
      data.email,
      data.code,
    );
    return { message: 'Verification mail has been sent' };
  }

  private async handleResetPasswordEmail(data: Omit<SendMailData, 'userId'>) {
    await this.mailService.sendResetPasswordMail(data.email, data.code);
    return { message: 'Password reset mail has been sent' };
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    switch (job.name) {
      case EMAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL:
        this.logger.log(
          `Sending verification email for user: id=${job.data['userId']}`,
        );
        break;

      case EMAIL_JOB_NAMES.SEND_RESET_PASSWORD_EMAIL:
        this.logger.log(
          `Sending reset password email for: email=${job.data['email']}`,
        );
        break;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    switch (job.name) {
      case EMAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL:
        this.logger.log(
          `Verification email has been sent for user: id=${job.data['userId']}`,
        );
        break;

      case EMAIL_JOB_NAMES.SEND_RESET_PASSWORD_EMAIL:
        this.logger.log(
          `Reset password email has been sent for: email=${job.data['email']}`,
        );
        break;
    }
  }

  @OnWorkerEvent('failed')
  async onJobFailed(job: Job, error: Error) {
    const maxAttempts = job.opts.attempts || 1;

    if (job.attemptsMade >= maxAttempts) {
      switch (job.name) {
        case EMAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL:
          await this.cache.del(String(job.data['userId']));
          this.logger.warn(
            `Failed to send verification email for user: id=${job.data['userId']}`,
          );
          break;

        case EMAIL_JOB_NAMES.SEND_RESET_PASSWORD_EMAIL:
          await this.cache.del(`reset-${job.data['email']}`);
          this.logger.warn(
            `Failed to send reset password email for user: email=${job.data['email']}`,
          );
          break;
      }
      this.logger.error(
        `Job ${job.name} with id=${job.id} has PERMANENTLY failed after ${job.attemptsMade} attempts, with error: ${error.message}`,
      );
    } else {
      this.logger.warn(
        `Job ${job.name} with id=${job.id} failed, with error: ${error.message}. Attempt ${job.attemptsMade} of ${maxAttempts}. Retrying...`,
      );
    }
  }
}
