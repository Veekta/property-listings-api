import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

import { ListingType } from './create-listing.dto.js';

export class ListListingsDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    default: 1,
    description: 'Page number.',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 20,
    default: 20,
    description: 'Number of listings to return per page.',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    enum: ListingType,
    example: ListingType.SALE,
    description: 'Filter listings by transaction type.',
  })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional({
    type: Number,
    example: 3000000,
    description: 'Minimum property price.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10000000,
    description: 'Maximum property price.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 3,
    description: 'Filter listings by number of bedrooms.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 6.5244,
    description: 'Latitude used as the center point for radius search.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 3.3792,
    description: 'Longitude used as the center point for radius search.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    description:
      'Search radius in kilometres. Requires latitude and longitude.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  radius?: number;
}
