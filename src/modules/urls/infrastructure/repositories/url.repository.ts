import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Url } from '../../domain/entities/url.entity';
import { IUrlRepository } from '../../domain/repositories/url.repository.interface';

@Injectable()
export class UrlRepository implements IUrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly repository: Repository<Url>,
  ) { }

  async create(url: Partial<Url>): Promise<Url> {
    const newUrl = this.repository.create(url);
    if (newUrl.userId) {
      return await this.repository.save(newUrl);
    }
    return newUrl;
  }

  async findBySlug(slug: string): Promise<Url | null> {
    return this.repository.findOne({
      where: { slug, deletedAt: null },
      relations: ['user'],
    });
  }

  async findById(id: string): Promise<Url | null> {
    const url = await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });

    return url;
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ urls: Url[]; total: number }> {
    const [urls, total] = await this.repository.findAndCount({
      where: { userId, deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { urls, total };
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ urls: Url[]; total: number }> {
    const [urls, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { urls, total };
  }

  async update(id: string, data: Partial<Url>): Promise<Url> {
    await this.repository.update({ id, deletedAt: null }, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update({ id }, { deletedAt: new Date() });
  }

  async incrementClicks(id: string): Promise<void> {
    await this.repository.increment({ id, deletedAt: null }, 'clicks', 1);
  }

  async findExpiredUrls(): Promise<Url[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        expiresAt: LessThan(now),
        deletedAt: null,
      },
    });
  }
}
