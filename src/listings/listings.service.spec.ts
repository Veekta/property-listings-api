import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from '../database/database.service.js';
import { CreateListingDto, ListingType } from './dto/create-listing.dto.js';
import { ListingsService } from './listings.service.js';

describe('ListingsService', () => {
  let service: ListingsService;

  const createMock = vi.fn();
  const firstMock = vi.fn();
  const selectMock = vi.fn();
  const limitMock = vi.fn();
  const offsetMock = vi.fn();
  const allMock = vi.fn();
  const aggregateMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();

  const whereMock = vi.fn();

  const queryMock = {
    where: whereMock,
    select: selectMock,
    first: firstMock,
    limit: limitMock,
    offset: offsetMock,
    all: allMock,
    aggregate: aggregateMock,
    update: updateMock,
    delete: deleteMock,
  };

  const databaseServiceMock = {
    client: {
      orm: {
        public: {
          Listing: {
            create: createMock,
            select: selectMock,
            first: firstMock,
            limit: limitMock,
            offset: offsetMock,
            all: allMock,
            aggregate: aggregateMock,
            where: whereMock,
            update: updateMock,
          },
        },
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    whereMock.mockReturnValue(queryMock);
    selectMock.mockReturnValue(queryMock);
    limitMock.mockReturnValue(queryMock);
    offsetMock.mockReturnValue(queryMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: DatabaseService,
          useValue: databaseServiceMock,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a listing with a PostGIS Point', async () => {
      const createdListing = {
        id: 'listing-id',
        title: 'Three Bedroom Apartment',
        price: '5000000',
        type: 'SALE',
        bedrooms: 3,
        location: {
          type: 'Point',
          coordinates: [3.3792, 6.5244],
          srid: 4326,
        },
        agentId: '550e8400-e29b-41d4-a716-446655440000',
      };

      createMock.mockResolvedValue(createdListing);

      const result = await service.create({
        title: 'Three Bedroom Apartment',
        price: 5000000,
        type: ListingType.SALE,
        bedrooms: 3,
        latitude: 6.5244,
        longitude: 3.3792,
        agentId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(createMock).toHaveBeenCalledWith({
        title: 'Three Bedroom Apartment',
        price: '5000000',
        type: ListingType.SALE,
        bedrooms: 3,
        location: {
          type: 'Point',
          coordinates: [3.3792, 6.5244],
          srid: 4326,
        },
        agentId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual(createdListing);
    });
  });

  describe('findOne', () => {
    it('should return a listing when it exists', async () => {
      const listing = {
        id: 'listing-id',
        title: 'Three Bedroom Apartment',
        price: '5000000',
        type: 'SALE' as const,
        bedrooms: 3,
        location: {
          type: 'Point',
          coordinates: [3.3792, 6.5244],
          srid: 4326,
        },
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      firstMock.mockResolvedValue(listing);

      const result = await service.findOne('listing-id');

      expect(firstMock).toHaveBeenCalledWith({
        id: 'listing-id',
      });

      expect(result).toEqual({
        id: 'listing-id',
        title: 'Three Bedroom Apartment',
        price: 5000000,
        type: 'SALE',
        bedrooms: 3,
        latitude: 6.5244,
        longitude: 3.3792,
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      });
    });

    it('should throw NotFoundException when the listing does not exist', async () => {
      firstMock.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        'Listing not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      const createdAt = new Date();
      const updatedAt = new Date();

      const listings = [
        {
          id: 'listing-1',
          title: 'Three Bedroom Apartment',
          price: '5000000',
          type: 'SALE' as const,
          bedrooms: 3,
          location: {
            type: 'Point',
            coordinates: [3.3792, 6.5244],
            srid: 4326,
          },
          agentId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt,
          updatedAt,
        },
      ];

      allMock.mockResolvedValue(listings);

      aggregateMock.mockResolvedValue({
        total: 5,
      });

      const result = await service.findAll({
        page: 2,
        limit: 2,
      });

      expect(selectMock).toHaveBeenCalled();

      expect(limitMock).toHaveBeenCalledWith(2);
      expect(offsetMock).toHaveBeenCalledWith(2);

      expect(allMock).toHaveBeenCalled();

      expect(aggregateMock).toHaveBeenCalled();

      expect(result).toEqual({
        data: [
          {
            id: 'listing-1',
            title: 'Three Bedroom Apartment',
            price: 5000000,
            type: 'SALE',
            bedrooms: 3,
            latitude: 6.5244,
            longitude: 3.3792,
            agentId: '550e8400-e29b-41d4-a716-446655440000',
            createdAt,
            updatedAt,
          },
        ],
        meta: {
          page: 2,
          limit: 2,
          total: 5,
          totalPages: 3,
          hasNext: true,
          hasPrevious: true,
        },
      });
    });

    it('should filter listings by type', async () => {
      allMock.mockResolvedValue([]);
      aggregateMock.mockResolvedValue({
        total: 0,
      });

      const eqMock = vi.fn();

      await service.findAll({
        page: 1,
        limit: 20,
        type: ListingType.SALE,
      });

      expect(whereMock).toHaveBeenCalledTimes(1);

      const whereCallback = whereMock.mock.calls[0][0];

      whereCallback({
        type: {
          eq: eqMock,
        },
      });

      expect(eqMock).toHaveBeenCalledWith(ListingType.SALE);
    });

    it('should filter listings by minimum and maximum price', async () => {
      allMock.mockResolvedValue([]);
      aggregateMock.mockResolvedValue({
        total: 0,
      });

      const gteMock = vi.fn();
      const lteMock = vi.fn();

      await service.findAll({
        page: 1,
        limit: 20,
        minPrice: 1000000,
        maxPrice: 5000000,
      });

      expect(whereMock).toHaveBeenCalledTimes(2);

      const minPriceCallback = whereMock.mock.calls[0][0];

      minPriceCallback({
        price: {
          gte: gteMock,
        },
      });

      const maxPriceCallback = whereMock.mock.calls[1][0];

      maxPriceCallback({
        price: {
          lte: lteMock,
        },
      });

      expect(gteMock).toHaveBeenCalledWith('1000000');
      expect(lteMock).toHaveBeenCalledWith('5000000');
    });

    it('should filter listings by bedrooms', async () => {
      allMock.mockResolvedValue([]);
      aggregateMock.mockResolvedValue({
        total: 0,
      });

      const eqMock = vi.fn();

      await service.findAll({
        page: 1,
        limit: 20,
        bedrooms: 3,
      });

      expect(whereMock).toHaveBeenCalledTimes(1);

      const bedroomsCallback = whereMock.mock.calls[0][0];

      bedroomsCallback({
        bedrooms: {
          eq: eqMock,
        },
      });

      expect(eqMock).toHaveBeenCalledWith(3);
    });

    it('should filter listings by radius using PostGIS distanceSphere', async () => {
      allMock.mockResolvedValue([]);
      aggregateMock.mockResolvedValue({
        total: 0,
      });

      const lteMock = vi.fn();

      await service.findAll({
        page: 1,
        limit: 20,
        latitude: 6.5244,
        longitude: 3.3792,
        radius: 10,
      });

      expect(whereMock).toHaveBeenCalledTimes(1);

      const whereCallback = whereMock.mock.calls[0][0];

      const distanceSphereMock = vi.fn(() => ({
        lte: lteMock,
      }));

      whereCallback({
        location: {
          distanceSphere: distanceSphereMock,
        },
      });

      expect(distanceSphereMock).toHaveBeenCalledWith({
        type: 'Point',
        coordinates: [3.3792, 6.5244],
        srid: 4326,
      });

      expect(lteMock).toHaveBeenCalledWith(10_000);
    });

    it('should reject a radius search when latitude is missing', async () => {
      await expect(
        service.findAll({
          page: 1,
          limit: 20,
          longitude: 3.3792,
          radius: 10,
        }),
      ).rejects.toThrow(
        'latitude, longitude, and radius must be provided together',
      );
    });

    it('should reject a radius search when longitude is missing', async () => {
      await expect(
        service.findAll({
          page: 1,
          limit: 20,
          latitude: 6.5244,
          radius: 10,
        }),
      ).rejects.toThrow(
        'latitude, longitude, and radius must be provided together',
      );
    });

    it('should reject a radius search when radius is missing', async () => {
      await expect(
        service.findAll({
          page: 1,
          limit: 20,
          latitude: 6.5244,
          longitude: 3.3792,
        }),
      ).rejects.toThrow(
        'latitude, longitude, and radius must be provided together',
      );
    });
  });

  describe('update', () => {
    it('should update a listing', async () => {
      const updatedListing = {
        id: 'listing-id',
        title: 'Updated Apartment',
        price: '5500000',
        type: 'SALE' as const,
        bedrooms: 4,
        location: {
          type: 'Point',
          coordinates: [3.3792, 6.5244],
          srid: 4326,
        },
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateMock.mockResolvedValue(updatedListing);

      const result = await service.update('listing-id', {
        title: 'Updated Apartment',
        price: 5500000,
        bedrooms: 4,
      });

      expect(whereMock).toHaveBeenCalledWith({
        id: 'listing-id',
      });

      expect(updateMock).toHaveBeenCalledWith({
        title: 'Updated Apartment',
        price: '5500000',
        bedrooms: 4,
      });

      expect(result).toEqual({
        id: 'listing-id',
        title: 'Updated Apartment',
        price: 5500000,
        type: 'SALE',
        bedrooms: 4,
        latitude: 6.5244,
        longitude: 3.3792,
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: updatedListing.createdAt,
        updatedAt: updatedListing.updatedAt,
      });
    });

    it('should reject an update when latitude is provided without longitude', async () => {
      await expect(
        service.update('listing-id', {
          latitude: 6.5244,
        }),
      ).rejects.toThrow('latitude and longitude must be provided together');
    });

    it('should reject an update when longitude is provided without latitude', async () => {
      await expect(
        service.update('listing-id', {
          longitude: 3.3792,
        }),
      ).rejects.toThrow('latitude and longitude must be provided together');
    });

    it('should reject an empty update', async () => {
      await expect(service.update('listing-id', {})).rejects.toThrow(
        'At least one field must be provided for update',
      );

      expect(updateMock).not.toHaveBeenCalled();
    });

    it('should update a listing location with a PostGIS Point', async () => {
      const updatedListing = {
        id: 'listing-id',
        title: 'Three Bedroom Apartment',
        price: '5000000',
        type: 'SALE' as const,
        bedrooms: 3,
        location: {
          type: 'Point',
          coordinates: [3.4, 6.55],
          srid: 4326,
        },
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateMock.mockResolvedValue(updatedListing);

      const result = await service.update('listing-id', {
        latitude: 6.55,
        longitude: 3.4,
      });

      expect(updateMock).toHaveBeenCalledWith({
        location: {
          type: 'Point',
          coordinates: [3.4, 6.55],
          srid: 4326,
        },
      });

      expect(result).toEqual({
        id: 'listing-id',
        title: 'Three Bedroom Apartment',
        price: 5000000,
        type: 'SALE',
        bedrooms: 3,
        latitude: 6.55,
        longitude: 3.4,
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: updatedListing.createdAt,
        updatedAt: updatedListing.updatedAt,
      });
    });

    it('should throw NotFoundException when updating a listing that does not exist', async () => {
      updateMock.mockResolvedValue(null);

      await expect(
        service.update('missing-id', {
          title: 'Updated Apartment',
        }),
      ).rejects.toThrow('Listing not found');

      expect(whereMock).toHaveBeenCalledWith({
        id: 'missing-id',
      });

      expect(updateMock).toHaveBeenCalledWith({
        title: 'Updated Apartment',
      });
    });
  });

  describe('remove', () => {
    it('should delete a listing', async () => {
      deleteMock.mockResolvedValue({
        id: 'listing-id',
      });

      const result = await service.remove('listing-id');

      expect(whereMock).toHaveBeenCalledWith({
        id: 'listing-id',
      });

      expect(deleteMock).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Listing deleted successfully',
        id: 'listing-id',
      });
    });

    it('should throw NotFoundException when deleting a listing that does not exist', async () => {
      deleteMock.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        'Listing not found',
      );

      expect(whereMock).toHaveBeenCalledWith({
        id: 'missing-id',
      });

      expect(deleteMock).toHaveBeenCalled();
    });
  });
});
