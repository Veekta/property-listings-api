import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { mapListing } from './mappers/listing.mapper.js';
import { ListListingsDto } from './dto/list-listings.dto.js';

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

  async findAll(query: ListListingsDto) {
    const { page, limit } = query;

    const offset = (page - 1) * limit;

    const [listings, countResult] = await Promise.all([
      this.databaseService.client.orm.public.Listing.limit(limit)
        .offset(offset)
        .all(),

      this.databaseService.client.orm.public.Listing.aggregate((builder) => ({
        total: builder.count(),
      })),
    ]);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    return {
      data: listings.map(mapListing),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}
