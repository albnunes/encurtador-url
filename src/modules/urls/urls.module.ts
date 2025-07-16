import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  UrlController,
  RedirectController,
} from './infrastructure/controllers/url.controller';
import { UrlService } from './application/services/url.service';
import { UrlRepository } from './infrastructure/repositories/url.repository';
import { Url } from './domain/entities/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), ConfigModule],
  controllers: [UrlController, RedirectController],
  providers: [
    UrlService,
    UrlRepository,
    {
      provide: 'IUrlRepository',
      useExisting: UrlRepository,
    },
  ],
  exports: [UrlService, UrlRepository],
})
export class UrlsModule { }
