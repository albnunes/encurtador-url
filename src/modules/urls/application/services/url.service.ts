import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import { IUrlRepository } from '../../domain/repositories/url.repository.interface';
import { Url } from '../../domain/entities/url.entity';
import { User } from '../../../auth/domain/entities/user.entity';
import { CreateUrlDto, UpdateUrlDto, UrlUserResponseDto } from '../dtos/url.dto';
import { AppLoggerService } from '../../../../shared/infrastructure/logging';


@Injectable()
export class UrlService {
  constructor(
    @Inject('IUrlRepository')
    private readonly urlRepository: IUrlRepository,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) { }

  async createUrl(createUrlDto: CreateUrlDto, userId?: string): Promise<Url> {
    this.logger.log('URL creation attempt', {
      originalUrl: createUrlDto.originalUrl,
      userId,
      expiresAt: createUrlDto.expiresAt,
    });

    const slug = await this.generateUniqueSlug();

    if (createUrlDto.expiresAt) {
      const expirationDate = new Date(createUrlDto.expiresAt);
      const now = new Date();

      if (expirationDate <= now) {
        this.logger.warn('URL creation failed: expiration date in the past', {
          originalUrl: createUrlDto.originalUrl,
          expiresAt: createUrlDto.expiresAt,
          userId,
        });
        throw new ConflictException('Expiration date cannot be in the past');
      }
    }

    const urlData = {
      ...createUrlDto,
      userId: userId || undefined,
      slug,
      expiresAt: new Date(createUrlDto.expiresAt)
    };

    const url = await this.urlRepository.create(urlData);


    return url;
  }

  async findBySlug(slug: string): Promise<Url> {
    this.logger.log('URL access attempt', { slug });

    const url = await this.urlRepository.findBySlug(slug);
    if (!url) {
      this.logger.warn('URL not found', { slug });
      throw new NotFoundException('URL not found');
    }

    if (url.isExpired()) {
      this.logger.warn('URL access failed: URL expired', {
        slug,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
      });
      throw new NotFoundException('URL has expired');
    }

    return url;
  }

  async findById(id: string): Promise<Url> {
    const url = await this.urlRepository.findById(id);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Transform user data to exclude password
    if (url.user) {
      url.user = this.transformUserData(url.user) as any;
    }

    return url;
  }

  async findByUserId(userId: string, page = 1, limit = 10) {
    const result = await this.urlRepository.findByUserId(userId, page, limit);

    // Transform user data for each URL to exclude password
    result.urls = result.urls.map(url => {
      if (url.user) {
        url.user = this.transformUserData(url.user) as any;
      }
      return url;
    });

    return result;
  }

  async findAll(page = 1, limit = 10) {
    return this.urlRepository.findAll(page, limit);
  }

  async updateUrl(
    id: string,
    updateUrlDto: UpdateUrlDto,
    userId: string,
  ): Promise<Url> {
    const url = await this.urlRepository.findById(id);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (!url.user || url.user.id !== userId) {
      throw new NotFoundException('URL not found');
    }

    if (updateUrlDto.expiresAt) {
      const expirationDate = new Date(updateUrlDto.expiresAt);
      const now = new Date();

      if (expirationDate <= now) {
        throw new ConflictException('Expiration date cannot be in the past');
      }
    }

    const updateData = {
      ...updateUrlDto,
      expiresAt: updateUrlDto.expiresAt
        ? new Date(updateUrlDto.expiresAt)
        : undefined,
    };

    const updatedUrl = await this.urlRepository.update(id, updateData);

    if (updateUrlDto.qrCode !== undefined) {
      await this.urlRepository.update(id, { qrCode: updateUrlDto.qrCode });
    }

    // Transform user data to exclude password
    if (updatedUrl.user) {
      updatedUrl.user = this.transformUserData(updatedUrl.user) as any;
    }

    return updatedUrl;
  }

  async deleteUrl(id: string, userId: string): Promise<{ message: string }> {
    const url = await this.urlRepository.findById(id);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (!url.user || url.user.id !== userId) {
      throw new NotFoundException('URL not found');
    }

    await this.urlRepository.softDelete(id);
    return { message: 'URL deleted successfully' };
  }

  async incrementClicks(id: string): Promise<void> {
    this.logger.log('Incrementing URL clicks', { urlId: id });
    await this.urlRepository.incrementClicks(id);
  }

  async generateShortUrl(slug: string): Promise<string> {
    const baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/${slug}`;
  }

  private transformUserData(user: User): UrlUserResponseDto | undefined {
    if (!user) return undefined;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }



  private async generateUniqueSlug(): Promise<string> {
    let slug: string;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      slug = this.generateRandomSlug();
      attempts++;

      if (attempts > maxAttempts) {
        throw new ConflictException('Unable to generate unique slug');
      }
    } while (await this.urlRepository.findBySlug(slug));

    return slug;
  }

  private generateRandomSlug(): string {
    return nanoid(6);
  }
}
