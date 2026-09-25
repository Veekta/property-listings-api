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

import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListingsService } from './listings.service.js';
import { ListListingsDto } from './dto/list-listings.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';

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

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, updateListingDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listingsService.remove(id);
  }
}
