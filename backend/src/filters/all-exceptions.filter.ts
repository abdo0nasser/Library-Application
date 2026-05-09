import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as any).clientVersion === 'string'
    ) {
      // Prisma Client Known Request Error Duck Typing due to dynamic imports
      const prismaError = exception as any;
      switch (prismaError.code) {
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Unique constraint violation';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = prismaError.message.replace(/\n/g, '');
          break;
      }
    }

    // Log the exception — include stack trace for 5xx errors
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} — ${
          typeof message === 'string' ? message : JSON.stringify(message)
        }`,
      );
    }

    response.status(status).json(
      typeof message === 'object'
        ? message
        : {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
          },
    );
  }
}
