import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppLoggerService } from './logger.service';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggingExceptionFilter } from './exception.filter';
import { RequestContextMiddleware } from './request-context.middleware';

@Global()
@Module({
    providers: [
        AppLoggerService,
        RequestContextMiddleware,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: LoggingExceptionFilter,
        },
    ],
    exports: [AppLoggerService, RequestContextMiddleware],
})
export class LoggingModule { } 