import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { db } from '../src/prisma/db.js';

describe('Listings (e2e)', () => {
  let app: INestApplication;
  let agentId: string;
  let listingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const agent = await db.orm.public.Agent.create({
      name: 'E2E Test Agent',
      email: `e2e-${Date.now()}@example.com`,
      phone: '08000000000',
    });

    agentId = agent.id;
  });

  afterAll(async () => {
    if (listingId) {
      await db.orm.public.Listing.where({ id: listingId }).delete();
    }

    if (agentId) {
      await db.orm.public.Agent.where({ id: agentId }).delete();
    }

    await app.close();
  });

  it('should create and retrieve a listing', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send({
        title: 'E2E Three Bedroom Apartment',
        price: 5000000,
        type: 'SALE',
        bedrooms: 3,
        latitude: 6.5244,
        longitude: 3.3792,
        agentId,
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      title: 'E2E Three Bedroom Apartment',
      type: 'SALE',
      bedrooms: 3,
      agentId,
    });

    expect(createResponse.body.id).toBeDefined();

    listingId = createResponse.body.id;

    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/listings/${listingId}`)
      .expect(200);

    expect(getResponse.body).toMatchObject({
      id: listingId,
      title: 'E2E Three Bedroom Apartment',
      price: 5000000,
      type: 'SALE',
      bedrooms: 3,
      latitude: 6.5244,
      longitude: 3.3792,
      agentId,
    });
  });

  it('should update a listing and persist the changes', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send({
        title: 'E2E Update Test Apartment',
        price: 4000000,
        type: 'SALE',
        bedrooms: 2,
        latitude: 6.5244,
        longitude: 3.3792,
        agentId,
      })
      .expect(201);

    const updateListingId = createResponse.body.id;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/v1/listings/${updateListingId}`)
      .send({
        title: 'E2E Updated Apartment',
        price: 4500000,
        bedrooms: 3,
      })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      id: updateListingId,
      title: 'E2E Updated Apartment',
      price: 4500000,
      type: 'SALE',
      bedrooms: 3,
      latitude: 6.5244,
      longitude: 3.3792,
      agentId,
    });

    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/listings/${updateListingId}`)
      .expect(200);

    expect(getResponse.body).toMatchObject({
      id: updateListingId,
      title: 'E2E Updated Apartment',
      price: 4500000,
      type: 'SALE',
      bedrooms: 3,
      latitude: 6.5244,
      longitude: 3.3792,
      agentId,
    });

    await db.orm.public.Listing.where({ id: updateListingId }).delete();
  });

  it('should delete a listing and return not found afterward', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send({
        title: 'E2E Delete Test Apartment',
        price: 3000000,
        type: 'RENT',
        bedrooms: 2,
        latitude: 6.5244,
        longitude: 3.3792,
        agentId,
      })
      .expect(201);

    const deleteListingId = createResponse.body.id;

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/api/v1/listings/${deleteListingId}`)
      .expect(200);

    expect(deleteResponse.body).toEqual({
      message: 'Listing deleted successfully',
      id: deleteListingId,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/listings/${deleteListingId}`)
      .expect(404);
  });
});
