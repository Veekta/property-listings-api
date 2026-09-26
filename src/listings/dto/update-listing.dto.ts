import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { ListingType } from './create-listing.dto.js';

export class UpdateListingDto {
  @ApiPropertyOptional({
    example: 'Updated Three Bedroom Apartment',
    description: 'Updated title of the property listing.',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 5500000,
    description: 'Updated property price.',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    enum: ListingType,
    example: ListingType.SALE,
    description: 'Updated type of property transaction.',
  })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional({
    example: 3,
    description: 'Updated number of bedrooms.',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({
    example: 6.5244,
    description: 'Updated latitude of the property location.',
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    example: 3.3792,
    description: 'Updated longitude of the property location.',
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
