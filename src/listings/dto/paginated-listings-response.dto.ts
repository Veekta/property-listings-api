import { ApiProperty } from '@nestjs/swagger';

import { ListingResponseDto } from './listing-response.dto.js';
import { PaginationMetaDto } from './pagination-meta.dto.js';

export class PaginatedListingsResponseDto {
  @ApiProperty({
    type: [ListingResponseDto],
    description: 'List of property listings.',
  })
  data!: ListingResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination information.',
  })
  meta!: PaginationMetaDto;
}
