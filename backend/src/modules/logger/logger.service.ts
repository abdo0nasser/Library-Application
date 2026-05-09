import { Injectable, Logger, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger = new Logger();

  setContext(context: string) {
    this.logger = new Logger(context);
  }

  log(message: string, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }

  error(message: string, trace?: string, ...optionalParams: any[]) {
    this.logger.error(message, trace, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams);
  }
}
