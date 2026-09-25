import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  IsPositive,
} from 'class-validator';

export enum ListingType {
  RENT = 'RENT',
  SALE = 'SALE',
  SHORTLET = 'SHORTLET',
}

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsEnum(ListingType)
  type!: ListingType;

  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsUUID()
  agentId!: string;
}
