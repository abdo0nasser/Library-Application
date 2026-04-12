import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  data: T;
  metadata?: any;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        // Exclude redirect/buffer cases naturally handled by nestjs
        if (!result) return { data: result };

        // Handle cases where service explicitly returns paginated or structured data
        if (
          result &&
          typeof result === 'object' &&
          Object.keys(result).every((k) =>
            ['data', 'metadata', 'message'].includes(k),
          ) &&
          Object.keys(result).length > 0
        ) {
          return {
            data: result.data ?? null,
            ...(result.metadata && { metadata: result.metadata }),
            ...(result.message && { message: result.message }),
          };
        }

        // Standard wrapping for single entities or explicit arrays
        return { data: result };
      }),
    );
  }
}
