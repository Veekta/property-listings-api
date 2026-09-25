import { Body, Controller, Post, Get, Query } from '@nestjs/common';

import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListingsService } from './listings.service.js';
import { ListListingsDto } from './dto/list-listings.dto.js';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  create(@Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(createListingDto);
  }

  @Get()
  findAll(@Query() query: ListListingsDto) {
    return this.listingsService.findAll(query);
  }
}
