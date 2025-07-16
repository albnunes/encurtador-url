import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from './logger.service';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: AppLoggerService) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: typeof message === 'string' ? message : (message as any).message || 'Internal server error',
        };


        this.logger.error(
            `Exception occurred: ${request.method} ${request.url}`,
            exception instanceof Error ? exception.stack : undefined,
            {
                statusCode: status,
                method: request.method,
                url: request.url,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                body: request.body,
                params: request.params,
                query: request.query,
                headers: request.headers,
                error: exception instanceof Error ? exception.message : String(exception),
            },
        );

        response.status(status).json(errorResponse);
    }
} 