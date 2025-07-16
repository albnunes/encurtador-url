import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { UrlService } from './url.service';
import { IUrlRepository } from '../../domain/repositories/url.repository.interface';
import { Url } from '../../domain/entities/url.entity';
import { CreateUrlDto, UpdateUrlDto } from '../dtos/url.dto';
import { AppLoggerService } from '../../../../shared/infrastructure/logging';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: jest.Mocked<IUrlRepository>;
  let configService: jest.Mocked<ConfigService>;
  let loggerService: jest.Mocked<AppLoggerService>;

  const mockUrl: Url = {
    id: '1',
    originalUrl: 'https://www.google.com',
    slug: 'abc123',
    clicks: 0,
    title: 'Google',
    description: 'Search engine',
    expiresAt: null,
    deletedAt: null,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user1',
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      urls: [],
      hasId: () => true,
      save: jest.fn(),
      remove: jest.fn(),
      softRemove: jest.fn(),
      recover: jest.fn(),
      reload: jest.fn(),
    } as any,
    isExpired: jest.fn(),
    isDeleted: jest.fn(),
    incrementClicks: jest.fn(),
    qrCode: false,
  } as Url;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: 'IUrlRepository',
          useValue: {
            create: jest.fn(),
            findBySlug: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            incrementClicks: jest.fn(),
            findExpiredUrls: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),

          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepository = module.get('IUrlRepository');
    configService = module.get(ConfigService);
    loggerService = module.get(AppLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUrl', () => {
    const createUrlDto: CreateUrlDto = {
      originalUrl: 'https://www.google.com',
      title: 'Google',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: 'Search engine',
    };

    it('should create a new URL successfully', async () => {
      urlRepository.findBySlug.mockResolvedValue(null);
      urlRepository.create.mockResolvedValue(mockUrl);

      await service.createUrl(createUrlDto, 'user1');

      expect(urlRepository.create).toHaveBeenCalledWith({
        ...createUrlDto,
        expiresAt: expect.anything(),
        slug: expect.any(String),
        userId: 'user1',
      });
    });

    it('should create URL without user ID for anonymous users', async () => {
      urlRepository.findBySlug.mockResolvedValue(null);
      urlRepository.create.mockResolvedValue(mockUrl);

      await service.createUrl(createUrlDto);

      expect(urlRepository.create).toHaveBeenCalledWith({
        ...createUrlDto,
        expiresAt: expect.anything(),
        slug: expect.any(String),
        userId: undefined,
      });
    });
  });

  describe('findBySlug', () => {
    it('should return URL if found and not expired', async () => {
      urlRepository.findBySlug.mockResolvedValue(mockUrl);
      mockUrl.isExpired = jest.fn().mockReturnValue(false);

      const result = await service.findBySlug('abc123');

      expect(result).toBe(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if URL is expired', async () => {
      urlRepository.findBySlug.mockResolvedValue(mockUrl);
      mockUrl.isExpired = jest.fn().mockReturnValue(true);

      await expect(service.findBySlug('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return URL if found', async () => {
      urlRepository.findById.mockResolvedValue(mockUrl);

      const result = await service.findById('1');

      expect(result).toBe(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUrl', () => {
    const updateUrlDto: UpdateUrlDto = {
      title: 'Updated Google',
    };

    it('should update URL successfully', async () => {
      urlRepository.findById.mockResolvedValue(mockUrl);
      urlRepository.update.mockResolvedValue(mockUrl);

      const result = await service.updateUrl('1', updateUrlDto, 'user1');

      expect(urlRepository.update).toHaveBeenCalledWith('1', updateUrlDto);
      expect(result).toBe(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateUrl('1', updateUrlDto, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not the owner', async () => {
      urlRepository.findById.mockResolvedValue(mockUrl);

      await expect(
        service.updateUrl('1', updateUrlDto, 'user2'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUrl', () => {
    it('should delete URL successfully', async () => {
      urlRepository.findById.mockResolvedValue(mockUrl);
      urlRepository.softDelete.mockResolvedValue(undefined);

      await service.deleteUrl('1', 'user1');

      expect(urlRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepository.findById.mockResolvedValue(null);

      await expect(service.deleteUrl('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user is not the owner', async () => {
      urlRepository.findById.mockResolvedValue(mockUrl);

      await expect(service.deleteUrl('1', 'user2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateShortUrl', () => {
    it('should generate short URL with base URL', async () => {
      configService.get.mockReturnValue('http://localhost:3000');

      const result = await service.generateShortUrl('abc123');

      expect(result).toBe('http://localhost:3000/abc123');
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks successfully', async () => {
      urlRepository.incrementClicks.mockResolvedValue(undefined);

      await service.incrementClicks('1');

      expect(urlRepository.incrementClicks).toHaveBeenCalledWith('1');
    });
  });
});
