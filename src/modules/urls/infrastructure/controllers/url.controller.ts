import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UrlService } from '../../application/services/url.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import {
  CreateUrlDto,
  UpdateUrlDto,
  UrlResponseDto,
  UrlListResponseDto,
} from '../../application/dtos/url.dto';
import { JwtUser } from '../../../../types/jwt';
import { JwtDecoderUtil } from '../../../../shared/infrastructure/utils/jwt-decoder.util';
import { AppLoggerService } from '../../../../shared/infrastructure/logging';

@ApiTags('URLs')
@Controller('urls')
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly logger: AppLoggerService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new shortened URL' })
  @ApiResponse({
    status: 201,
    description: 'URL created successfully',
    type: UrlResponseDto,
  })
  async createUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Headers('Authorization') token: string,
  ): Promise<UrlResponseDto> {
    this.logger.log('URL creation request received', {
      originalUrl: createUrlDto.originalUrl,
      expiresAt: createUrlDto.expiresAt,
    });


    const decodedToken = JwtDecoderUtil.decodeToken(token);
    const userId = decodedToken.sub;

    this.logger.log('User authenticated for URL creation', {
      userId,
      userEmail: decodedToken.email,
    });

    const url = await this.urlService.createUrl(createUrlDto, userId);
    const shortUrl = await this.urlService.generateShortUrl(url.slug);

    const response = {
      ...url,
      shortUrl,
    };

    this.logger.log('URL created successfully', {
      urlId: url.id,
      slug: url.slug,
      shortUrl,
      userId,
    });

    return response;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user URLs with pagination' })
  @ApiResponse({
    status: 200,
    description: 'URLs retrieved successfully',
    type: UrlListResponseDto,
  })
  async getUserUrls(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req: { user: JwtUser },
  ): Promise<UrlListResponseDto> {
    const user = req.user;

    this.logger.log('User URLs request', {
      userId: user.id,
      page: +page,
      limit: +limit,
    });

    const result = await this.urlService.findByUserId(user.id, +page, +limit);

    this.logger.log('User URLs retrieved', {
      userId: user.id,
      totalUrls: result.total,
      returnedUrls: result.urls.length,
    });

    const urlsWithShortUrl = await Promise.all(
      result.urls.map(async (url) => ({
        ...url,
        shortUrl: await this.urlService.generateShortUrl(url.slug),
      })),
    );

    return {
      urls: urlsWithShortUrl,
      total: result.total,
      page: +page,
      limit: +limit,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get URL by ID' })
  @ApiResponse({
    status: 200,
    description: 'URL retrieved successfully',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async getUrlById(
    @Param('id') id: string,
    @Req() req: { user: JwtUser },
  ): Promise<UrlResponseDto> {
    const user = req.user;
    const url = await this.urlService.findById(id);

    if (url.user.id !== user.id) {
      throw new Error('URL not found');
    }

    const shortUrl = await this.urlService.generateShortUrl(url.slug);
    return { ...url, shortUrl };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update URL' })
  @ApiResponse({
    status: 200,
    description: 'URL updated successfully',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async updateUrl(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req: { user: JwtUser },
  ): Promise<UrlResponseDto> {
    const user = req.user;
    const url = await this.urlService.updateUrl(id, updateUrlDto, user.id);
    const shortUrl = await this.urlService.generateShortUrl(url.slug);

    return { ...url, shortUrl };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete URL' })
  @ApiResponse({ status: 204, description: 'URL deleted successfully' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUrl(
    @Param('id') id: string,
    @Req() req: { user: JwtUser },
  ): Promise<{ message: string }> {
    const user = req.user;

    this.logger.log('URL deletion request', {
      urlId: id,
      userId: user.id,
    });

    const result = await this.urlService.deleteUrl(id, user.id);

    this.logger.log('URL deleted successfully', {
      urlId: id,
      userId: user.id,
    });

    return result;
  }
}


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
  ): Promise<void> {
    this.logger.log('URL redirect request', { slug });

    const url = await this.urlService.findBySlug(slug);
    await this.urlService.incrementClicks(url.id);


    res.redirect(HttpStatus.FOUND, url.originalUrl);
  }
}
