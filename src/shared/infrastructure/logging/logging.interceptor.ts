import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLoggerService) { }

      intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'];
    const requestId = request['requestId'] || 'unknown';
    const realIp = request['realIp'] || request.ip || 'unknown';
    const startTime = request['startTime'] || Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - startTime;
                    const statusCode = response.statusCode;

                              this.logger.logRequest(
            method,
            url,
            statusCode,
            duration,
            userAgent,
            realIp,
          );
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    const statusCode = error.status || 500;

                                this.logger.error(
              `Request failed: ${method} ${url}`,
              error.stack,
              {
                method,
                url,
                statusCode,
                duration: `${duration}ms`,
                userAgent,
                ip: realIp,
                requestId,
                error: error.message,
              },
            );
                },
            }),
        );
    }
} 