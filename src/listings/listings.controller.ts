import { Body, Controller, Post } from '@nestjs/common';

import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListingsService } from './listings.service.js';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  create(@Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(createListingDto);
  }
}
