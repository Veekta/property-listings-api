import { Injectable, BadRequestException } from '@nestjs/common';

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

    const offset = (page - 1) * limit;

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

    const listingTable = this.databaseService.client.sql.public.listing;

    let listingsQuery = listingTable.select(
      'id',
      'title',
      'price',
      'type',
      'bedrooms',
      'location',
      'agentId',
      'createdAt',
      'updatedAt',
    );

    listingsQuery = listingsQuery.where((f, fns) => {
      const conditions = [];

      if (type) {
        conditions.push(fns.eq(f.type, type));
      }

      if (minPrice !== undefined) {
        conditions.push(fns.gte(f.price, minPrice.toString()));
      }

      if (maxPrice !== undefined) {
        conditions.push(fns.lte(f.price, maxPrice.toString()));
      }

      if (bedrooms !== undefined) {
        conditions.push(fns.eq(f.bedrooms, bedrooms));
      }

      if (searchPoint && radiusInMeters !== undefined) {
        conditions.push(
          fns.lte(fns.distanceSphere(f.location, searchPoint), radiusInMeters),
        );
      }

      if (conditions.length === 0) {
        return fns.eq(f.id, f.id);
      }

      if (conditions.length === 1) {
        return conditions[0];
      }

      return fns.and(...conditions);
    });

    const listingPlan = listingsQuery.limit(limit).offset(offset).build();

    const countPlan = listingTable
      .select('id')
      .where((f, fns) => {
        const conditions = [];

        if (type) {
          conditions.push(fns.eq(f.type, type));
        }

        if (minPrice !== undefined) {
          conditions.push(fns.gte(f.price, minPrice.toString()));
        }

        if (maxPrice !== undefined) {
          conditions.push(fns.lte(f.price, maxPrice.toString()));
        }

        if (bedrooms !== undefined) {
          conditions.push(fns.eq(f.bedrooms, bedrooms));
        }

        if (searchPoint && radiusInMeters !== undefined) {
          conditions.push(
            fns.lte(
              fns.distanceSphere(f.location, searchPoint),
              radiusInMeters,
            ),
          );
        }

        if (conditions.length === 0) {
          return fns.eq(f.id, f.id);
        }

        if (conditions.length === 1) {
          return conditions[0];
        }

        return fns.and(...conditions);
      })
      .build();

    const runtime = this.databaseService.client.runtime();

    const [listingRows, countRows] = await Promise.all([
      runtime.query(listingPlan),
      runtime.query(countPlan),
    ]);

    const total = countRows.length;
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
}
