import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';

@Injectable()
export class ListingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createListingDto: CreateListingDto) {
    const { title, price, type, bedrooms, latitude, longitude, agentId } =
      createListingDto;

    const location = {
      type: 'Point' as const,
      coordinates: [longitude, latitude] as [number, number],
      srid: 4326,
    };

    return this.databaseService.client.orm.public.Listing.create({
      title,
      price: price.toString(),
      type,
      bedrooms,
      location,
      agentId,
    });
  }
}
