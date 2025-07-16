import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UrlRepository } from './url.repository';
import { Url } from '../../domain/entities/url.entity';

describe('UrlRepository', () => {
    let repository: UrlRepository;
    let typeOrmRepository: jest.Mocked<Repository<Url>>;

    const mockUrl: Url = {
        id: '1',
        originalUrl: 'https://www.google.com',
        slug: 'abc123',
        clicks: 5,
        title: 'Google',
        description: 'Search engine',
        expiresAt: null,
        deletedAt: null,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCode: false,
        isExpired: jest.fn(),
        isDeleted: jest.fn(),
        incrementClicks: jest.fn(),
    } as Url;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UrlRepository,
                {
                    provide: getRepositoryToken(Url),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findAndCount: jest.fn(),
                        update: jest.fn(),
                        increment: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<UrlRepository>(UrlRepository);
        typeOrmRepository = module.get(getRepositoryToken(Url));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('incrementClicks', () => {
        it('should increment clicks successfully', async () => {
            typeOrmRepository.increment.mockResolvedValue({ affected: 1 } as any);

            await repository.incrementClicks('1');

            expect(typeOrmRepository.increment).toHaveBeenCalledWith(
                { id: '1', deletedAt: IsNull() },
                'clicks',
                1,
            );
        });

        it('should handle increment when no rows are affected', async () => {
            typeOrmRepository.increment.mockResolvedValue({ affected: 0 } as any);

            await repository.incrementClicks('1');

            expect(typeOrmRepository.increment).toHaveBeenCalledWith(
                { id: '1', deletedAt: IsNull() },
                'clicks',
                1,
            );
        });
    });

    describe('findByUserId', () => {
        it('should return URLs for user with pagination', async () => {
            const mockUrls = [mockUrl];
            typeOrmRepository.findAndCount.mockResolvedValue([mockUrls, 1]);

            const result = await repository.findByUserId('user1', 1, 10);

            expect(result.urls).toEqual(mockUrls);
            expect(result.total).toBe(1);
            expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
                where: { userId: 'user1', deletedAt: IsNull() },
                relations: ['user'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10,
            });
        });
    });
}); 