import { ConfigService } from '@nestjs/config';

export interface LoggingConfig {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    logDir: string;
    maxFileSize: number;
    maxFiles: number;
}

export const getLoggingConfig = (configService: ConfigService): LoggingConfig => {
    const environment = configService.get('NODE_ENV', 'development');

    return {
        level: configService.get('LOG_LEVEL', environment === 'production' ? 'info' : 'debug'),
        enableConsole: configService.get('LOG_CONSOLE', 'true') === 'true',
        enableFile: configService.get('LOG_FILE', 'true') === 'true',
        logDir: configService.get('LOG_DIR', 'logs'),
        maxFileSize: parseInt(configService.get('LOG_MAX_FILE_SIZE', '5242880')), 
        maxFiles: parseInt(configService.get('LOG_MAX_FILES', '5')),
    };
}; 