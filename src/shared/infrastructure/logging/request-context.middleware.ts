import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {

        req['requestId'] = this.generateRequestId();
        req['startTime'] = Date.now();


        req['realIp'] = this.getRealIp(req);

        next();
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getRealIp(req: Request): string {
        return (
            req.headers['x-forwarded-for'] as string ||
            req.headers['x-real-ip'] as string ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            'unknown'
        );
    }
} 