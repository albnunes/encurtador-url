import {
    Controller,
    Get,
    Param,
    Res,
    HttpStatus,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { UrlService } from '../../application/services/url.service';
import { AppLoggerService } from '../../../../shared/infrastructure/logging';

@ApiTags('Redirect')
@Controller()
export class RedirectController {
    constructor(
        private readonly urlService: UrlService,
        private readonly logger: AppLoggerService,
    ) { }

    @Get(':slug')
    @ApiOperation({ summary: 'Redirect to original URL' })
    @ApiResponse({ status: 302, description: 'Redirect to original URL' })
    @ApiResponse({ status: 404, description: 'URL not found or expired' })
    async redirectToOriginal(
        @Param('slug') slug: string,
        @Res() res: Response,
        @Req() req: Request,
    ): Promise<void> {
        this.logger.log('URL redirect request', {
            slug,
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer']
        });

        const url = await this.urlService.findBySlug(slug);

        const cookieName = `clicked_${url.id}`;
        const hasClickedRecently = req.cookies[cookieName];

        if (!hasClickedRecently) {
            this.logger.log('URL found, incrementing clicks', {
                urlId: url.id,
                originalUrl: url.originalUrl,
                currentClicks: url.clicks
            });

            await this.urlService.incrementClicks(url.id);


            res.cookie(cookieName, 'true', {
                maxAge: 2000, 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            this.logger.log('Clicks incremented and cookie set', { urlId: url.id });
        } else {
            this.logger.log('Skipping click increment - clicked recently', {
                urlId: url.id,
                cookieValue: hasClickedRecently
            });
        }

        this.logger.log('Redirecting to original URL', {
            originalUrl: url.originalUrl,
            slug
        });

        res.redirect(HttpStatus.FOUND, url.originalUrl);
    }
} 