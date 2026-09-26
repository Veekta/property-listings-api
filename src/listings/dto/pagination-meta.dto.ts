import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    example: 1,
    description: 'Current page number.',
  })
  page!: number;

  @ApiProperty({
    example: 20,
    description: 'Number of listings requested per page.',
  })
  limit!: number;

  @ApiProperty({
    example: 45,
    description: 'Total number of listings matching the query.',
  })
  total!: number;

  @ApiProperty({
    example: 3,
    description: 'Total number of pages.',
  })
  totalPages!: number;

  @ApiProperty({
    example: true,
    description: 'Whether another page of results exists.',
  })
  hasNext!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether a previous page of results exists.',
  })
  hasPrevious!: boolean;
}
