import { ApiProperty } from '@nestjs/swagger';

export class QRCodeResponseDto {
  @ApiProperty({
    description: 'QR Code as base64 data URL',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCode: string;

  @ApiProperty({
    description: 'The URL that the QR code represents',
    example: 'https://short.url/abc123',
  })
  url: string;

  @ApiProperty({
    description: 'Format of the QR code',
    example: 'image/png',
  })
  format: string;

  @ApiProperty({
    description: 'Width of the QR code in pixels',
    example: 200,
  })
  width: number;
}

export class QRCodeSVGResponseDto {
  @ApiProperty({
    description: 'QR Code as SVG string',
    example:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">...</svg>',
  })
  qrCode: string;

  @ApiProperty({
    description: 'The URL that the QR code represents',
    example: 'https://short.url/abc123',
  })
  url: string;

  @ApiProperty({
    description: 'Format of the QR code',
    example: 'svg',
  })
  format: string;

  @ApiProperty({
    description: 'Width of the QR code in pixels',
    example: 200,
  })
  width: number;
}
