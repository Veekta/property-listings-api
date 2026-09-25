import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListListingsDto } from './dto/list-listings.dto.js';
import { mapListing } from './mappers/listing.mapper.js';

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
    const {
      page,
      limit,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      latitude,
      longitude,
      radius,
    } = query;

    const hasLatitude = latitude !== undefined;
    const hasLongitude = longitude !== undefined;
    const hasRadius = radius !== undefined;

    if (hasLatitude || hasLongitude || hasRadius) {
      if (!hasLatitude || !hasLongitude || !hasRadius) {
        throw new BadRequestException(
          'latitude, longitude, and radius must be provided together',
        );
      }
    }

    const searchPoint =
      latitude !== undefined && longitude !== undefined && radius !== undefined
        ? {
            type: 'Point' as const,
            coordinates: [longitude, latitude] as [number, number],
            srid: 4326,
          }
        : undefined;

    const radiusInMeters = radius !== undefined ? radius * 1000 : undefined;

    /*
     * Build the base ORM query.
     *
     * Every filter here is applied to both:
     * 1. the paginated listing query
     * 2. the COUNT query
     */
    let listingsQuery = this.databaseService.client.orm.public.Listing;

    if (type !== undefined) {
      listingsQuery = listingsQuery.where((listing) => listing.type.eq(type));
    }

    if (minPrice !== undefined) {
      listingsQuery = listingsQuery.where((listing) =>
        listing.price.gte(minPrice.toString()),
      );
    }

    if (maxPrice !== undefined) {
      listingsQuery = listingsQuery.where((listing) =>
        listing.price.lte(maxPrice.toString()),
      );
    }

    if (bedrooms !== undefined) {
      listingsQuery = listingsQuery.where((listing) =>
        listing.bedrooms.eq(bedrooms),
      );
    }

    if (searchPoint !== undefined && radiusInMeters !== undefined) {
      listingsQuery = listingsQuery.where((listing) =>
        listing.location.distanceSphere(searchPoint).lte(radiusInMeters),
      );
    }

    const offset = (page - 1) * limit;

    const [listingRows, totals] = await Promise.all([
      listingsQuery
        .select(
          'id',
          'title',
          'price',
          'type',
          'bedrooms',
          'location',
          'agentId',
          'createdAt',
          'updatedAt',
        )
        .limit(limit)
        .offset(offset)
        .all(),

      listingsQuery.aggregate((aggregate) => ({
        total: aggregate.count(),
      })),
    ]);

    const total = totals.total;
    const totalPages = Math.ceil(total / limit);

    return {
      data: listingRows.map((listing) => mapListing(listing)),
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

  async findOne(id: string) {
    const listing = await this.databaseService.client.orm.public.Listing.select(
      'id',
      'title',
      'price',
      'type',
      'bedrooms',
      'location',
      'agentId',
      'createdAt',
      'updatedAt',
    ).first({ id });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return mapListing(listing);
  }
}
