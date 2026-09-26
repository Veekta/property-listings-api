import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
} from '@nestjs/common';

import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { ListingResponseDto } from './dto/listing-response.dto.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListingsService } from './listings.service.js';
import { ListListingsDto } from './dto/list-listings.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';
import { PaginatedListingsResponseDto } from './dto/paginated-listings-response.dto.js';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @ApiCreatedResponse({
    description: 'Listing successfully created.',
    type: ListingResponseDto,
  })
  @Post()
  create(@Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(createListingDto);
  }

  @ApiOkResponse({
    description: 'Listings retrieved successfully.',
    type: PaginatedListingsResponseDto,
  })
  @Get()
  findAll(@Query() query: ListListingsDto) {
    return this.listingsService.findAll(query);
  }

  @ApiOkResponse({
    description: 'Listing retrieved successfully.',
    type: ListingResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Listing not found.',
  })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listingsService.findOne(id);
  }

  @ApiOkResponse({
    description: 'Listing updated successfully.',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data.',
  })
  @ApiNotFoundResponse({
    description: 'Listing not found.',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, updateListingDto);
  }

  @ApiOkResponse({
    description: 'Listing deleted successfully.',
    schema: {
      example: {
        message: 'Listing deleted successfully',
        id: 'e93769fc-3e7d-4c3e-8060-5c88cd2d9e58',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Listing not found.',
  })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listingsService.remove(id);
  }
}
