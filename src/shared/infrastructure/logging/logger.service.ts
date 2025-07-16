import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { join } from 'node:path';

export interface LogContext {
    [key: string]: any;
}

@Injectable()
export class AppLoggerService implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
            ),
            defaultMeta: {
                service: 'encurtador-url-api',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
            },
            transports: [

                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),

                new winston.transports.File({
                    filename: join(process.cwd(), 'logs', 'error.log'),
                    level: 'error',
                    maxsize: 5242880, 
                    maxFiles: 5,
                }),

                new winston.transports.File({
                    filename: join(process.cwd(), 'logs', 'combined.log'),
                    maxsize: 5242880, 
                    maxFiles: 5,
                }),
            ],
        });


        const fs = require('node:fs');
        const logDir = join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message: string, context?: LogContext) {
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: LogContext) {
        this.logger.error(message, { trace, context });
    }

    warn(message: string, context?: LogContext) {
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: LogContext) {
        this.logger.debug(message, { context });
    }

    verbose(message: string, context?: LogContext) {
        this.logger.verbose(message, { context });
    }


    logRequest(method: string, url: string, statusCode: number, duration: number, userAgent?: string, ip?: string) {
        this.log('HTTP Request', {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userAgent,
            ip,
        });
    }



    logAuthentication(userId: string, action: 'login' | 'logout' | 'register', success: boolean, ip?: string) {
        this.log('Authentication Event', {
            userId,
            action,
            success,
            ip,
        });
    }




    logError(error: Error, context?: LogContext) {
        this.error(error.message, error.stack, context);
    }
} 