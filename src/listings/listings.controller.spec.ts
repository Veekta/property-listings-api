import { Test, TestingModule } from '@nestjs/testing';

import { CreateListingDto, ListingType } from './dto/create-listing.dto.js';
import { ListingsService } from './listings.service.js';
import { ListingsController } from './listings.controller.js';
import { ListListingsDto } from './dto/list-listings.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';

describe('ListingsController', () => {
  let controller: ListingsController;

  const listingsServiceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [
        {
          provide: ListingsService,
          useValue: listingsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ListingsController>(ListingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a listing', async () => {
    const dto: CreateListingDto = {
      title: 'Three Bedroom Apartment',
      price: 5000000,
      type: ListingType.SALE,
      bedrooms: 3,
      latitude: 6.5244,
      longitude: 3.3792,
      agentId: '550e8400-e29b-41d4-a716-446655440000',
    };

    const createdListing = {
      id: 'listing-id',
      ...dto,
    };

    listingsServiceMock.create.mockResolvedValue(createdListing);

    const result = await controller.create(dto);

    expect(listingsServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(createdListing);
  });

  it('should return all listings', async () => {
    const query: ListListingsDto = {
      page: 1,
      limit: 20,
      type: ListingType.SALE,
    };

    const listingsResult = {
      data: [
        {
          id: 'listing-id',
          title: 'Three Bedroom Apartment',
          price: 5000000,
          type: ListingType.SALE,
          bedrooms: 3,
          latitude: 6.5244,
          longitude: 3.3792,
          agentId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };

    listingsServiceMock.findAll.mockResolvedValue(listingsResult);

    const result = await controller.findAll(query);

    expect(listingsServiceMock.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(listingsResult);
  });

  it('should return a listing by id', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const listingResult = {
      id,
      title: 'Three Bedroom Apartment',
      price: 5000000,
      type: ListingType.SALE,
      bedrooms: 3,
      latitude: 6.5244,
      longitude: 3.3792,
      agentId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    listingsServiceMock.findOne.mockResolvedValue(listingResult);

    const result = await controller.findOne(id);

    expect(listingsServiceMock.findOne).toHaveBeenCalledWith(id);
    expect(result).toEqual(listingResult);
  });

  it('should update a listing', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const dto: UpdateListingDto = {
      title: 'Updated Apartment',
      price: 5500000,
      bedrooms: 4,
    };

    const updatedListing = {
      id,
      title: 'Updated Apartment',
      price: 5500000,
      type: ListingType.SALE,
      bedrooms: 4,
      latitude: 6.5244,
      longitude: 3.3792,
      agentId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    listingsServiceMock.update.mockResolvedValue(updatedListing);

    const result = await controller.update(id, dto);

    expect(listingsServiceMock.update).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(updatedListing);
  });

  it('should delete a listing', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const deleteResult = {
      message: 'Listing deleted successfully',
      id,
    };

    listingsServiceMock.remove.mockResolvedValue(deleteResult);

    const result = await controller.remove(id);

    expect(listingsServiceMock.remove).toHaveBeenCalledWith(id);
    expect(result).toEqual(deleteResult);
  });
});
