import { ApiProperty } from '@nestjs/swagger';

import { ListingType } from './create-listing.dto.js';

export class ListingResponseDto {
  @ApiProperty({
    example: '2ac79ae0-9b5f-48fb-932f-5d03ad18ac24',
    format: 'uuid',
    description: 'Unique identifier of the listing.',
  })
  id!: string;

  @ApiProperty({
    example: 'Abuja Four Bedroom House',
    description: 'Title of the property listing.',
  })
  title!: string;

  @ApiProperty({
    example: 8000000,
    description: 'Property price.',
  })
  price!: number;

  @ApiProperty({
    enum: ListingType,
    example: ListingType.SALE,
    description: 'Type of property transaction.',
  })
  type!: ListingType;

  @ApiProperty({
    example: 4,
    description: 'Number of bedrooms.',
  })
  bedrooms!: number;

  @ApiProperty({
    example: 9.0765,
    description: 'Latitude of the property location.',
  })
  latitude!: number;

  @ApiProperty({
    example: 7.3986,
    description: 'Longitude of the property location.',
  })
  longitude!: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'UUID of the agent associated with the listing.',
  })
  agentId!: string;

  @ApiProperty({
    example: '2026-09-25T17:38:31.914Z',
    description: 'Timestamp when the listing was created.',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-09-25T17:38:31.914Z',
    description: 'Timestamp when the listing was last updated.',
  })
  updatedAt!: string;
}
