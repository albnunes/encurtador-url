import { IsUrl, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({ example: 'https://www.google.com' })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({ example: 'My Google Link', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'A link to Google', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  @IsNotEmpty()
  @IsDateString()
  expiresAt: string;

  @ApiProperty({
    example: true,
    description: 'Whether to generate QR code for this URL',
    required: false,
  })
  @IsOptional()
  qrCode?: boolean;
}

export class UpdateUrlDto {
  @ApiProperty({ example: 'https://www.google.com', required: false })
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @ApiProperty({ example: 'My Updated Google Link', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'An updated link to Google', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    example: true,
    description: 'Whether to regenerate QR code for this URL',
    required: false,
  })
  @IsOptional()
  qrCode?: boolean;
}

export class UrlResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalUrl: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  clicks: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  shortUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Whether QR code is enabled for this URL',
  })
  qrCode?: boolean;
}

export class UrlListResponseDto {
  @ApiProperty({ type: [UrlResponseDto] })
  urls: UrlResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
