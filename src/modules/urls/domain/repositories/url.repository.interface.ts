import { Url } from '../entities/url.entity';

export interface IUrlRepository {
  create(url: Partial<Url>): Promise<Url>;
  findBySlug(slug: string): Promise<Url | null>;
  findById(id: string): Promise<Url | null>;
  findByUserId(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ urls: Url[]; total: number }>;
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{ urls: Url[]; total: number }>;
  update(id: string, data: Partial<Url>): Promise<Url>;
  softDelete(id: string): Promise<void>;
  incrementClicks(id: string): Promise<void>;
  findExpiredUrls(): Promise<Url[]>;
}
