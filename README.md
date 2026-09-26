# Property Listings API

A RESTful Property Listings API built with **Node.js, TypeScript, NestJS, PostgreSQL, PostGIS, and Prisma**.

The API allows clients to create, retrieve, update, delete, and search property listings, including filtering by property attributes and performing geospatial radius searches.

---

## Features

- Listing CRUD operations
- Property type filtering
- Price range filtering
- Bedroom filtering
- Geospatial radius search
- Pagination
- Request validation
- HTTP error handling
- PostgreSQL + PostGIS persistence
- Prisma ORM
- Swagger/OpenAPI documentation
- Unit tests
- End-to-end tests
- Docker-based PostgreSQL/PostGIS development environment

---

## Tech Stack

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| Node.js         | Runtime                     |
| TypeScript      | Application language        |
| NestJS          | Backend framework           |
| PostgreSQL      | Relational database         |
| PostGIS         | Geospatial data and queries |
| Prisma          | Database access layer       |
| class-validator | Request validation          |
| Swagger/OpenAPI | API documentation           |
| Vitest          | Unit and E2E testing        |
| Docker          | Local database environment  |

---

# Architecture

The application uses a modular layered architecture:

```text
Client
  |
  v
HTTP / REST API
  |
  v
Controllers
  |
  v
Validation
  |
  v
Services
  |
  v
Data Access
  |
  v
Prisma
  |
  v
PostgreSQL + PostGIS
```

````

### Controllers

Controllers handle HTTP concerns such as routes, request parameters, request bodies, and responses.

### Services

Services contain application and business logic and coordinate database operations.

### Data Access

Database access is isolated from HTTP concerns and handled through Prisma and the database layer.

### PostGIS

PostGIS is used for storing property locations and performing radius-based geographic searches at the database level.

The project intentionally uses a modular monolith rather than introducing microservices for this scope.

---

# API

The API is versioned under:

```text
/api/v1
```

## Base URL

```text
http://localhost:3000/api/v1
```

## Swagger Documentation

When running locally:

```text
http://localhost:3000/api/docs
```

Swagger provides interactive documentation for the available endpoints, request parameters, request bodies, and responses.

---

# Endpoints

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| POST   | `/api/v1/listings`     | Create a listing          |
| GET    | `/api/v1/listings`     | Retrieve listings         |
| GET    | `/api/v1/listings/:id` | Retrieve a single listing |
| PATCH  | `/api/v1/listings/:id` | Update a listing          |
| DELETE | `/api/v1/listings/:id` | Delete a listing          |

The collection endpoint also supports filtering and geospatial search through query parameters.

---

# Creating a Listing

```http
POST /api/v1/listings
```

Example:

```json
{
  "title": "Three Bedroom Apartment",
  "price": 5000000,
  "type": "SALE",
  "bedrooms": 3,
  "latitude": 6.5244,
  "longitude": 3.3792,
  "agentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Supported listing types:

```text
RENT
SALE
SHORTLET
```

---

# Listing Search and Filtering

The current implementation uses:

```http
GET /api/v1/listings
```

for both collection retrieval and filtered/geospatial search.

## Filter by type

```http
GET /api/v1/listings?type=SALE
```

## Filter by price range

```http
GET /api/v1/listings?minPrice=3000000&maxPrice=10000000
```

## Filter by bedrooms

```http
GET /api/v1/listings?bedrooms=3
```

## Geospatial search

```http
GET /api/v1/listings?latitude=6.5244&longitude=3.3792&radius=10
```

The radius is supplied in kilometres.

The application converts the radius to metres and delegates the geographic distance calculation to PostgreSQL/PostGIS.

## Combining filters

Filters can be combined:

```http
GET /api/v1/listings?type=SALE&minPrice=3000000&maxPrice=10000000&bedrooms=3&latitude=6.5244&longitude=3.3792&radius=10
```

All supplied filters must be satisfied.

---

# Pagination

The listing collection supports pagination using:

```text
page
limit
```

Example:

```http
GET /api/v1/listings?page=1&limit=20
```

The API limits the maximum page size to 100.

Example response:

```json
{
  "data": [
    {
      "id": "listing-id",
      "title": "Three Bedroom Apartment",
      "price": 5000000,
      "type": "SALE",
      "bedrooms": 3,
      "latitude": 6.5244,
      "longitude": 3.3792,
      "agentId": "agent-id",
      "createdAt": "2026-09-26 04:21:24.76383+00",
      "updatedAt": "2026-09-26 04:21:24.659+00"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

# Geospatial Search

Property locations are stored using PostGIS with SRID 4326.

The API accepts:

```text
latitude
longitude
radius
```

Example:

```http
GET /api/v1/listings?latitude=6.5244&longitude=3.3792&radius=10
```

This means:

> Return listings located within 10 kilometres of the supplied coordinates.

The distance calculation is performed by PostgreSQL/PostGIS rather than loading all listings into Node.js.

This approach keeps geospatial processing close to the data layer and provides a foundation for efficient location-based queries.

---

# Validation

Incoming requests are validated before reaching business logic.

Validation includes:

- Required fields
- String length
- Numeric values
- Integer values
- Listing type
- Latitude and longitude ranges
- UUID validation
- Pagination parameters
- Search parameters

For example:

```text
title: 3–200 characters
price: greater than 0
bedrooms: integer >= 0
latitude: -90 to 90
longitude: -180 to 180
radius: greater than 0
page: >= 1
limit: 1–100
```

Invalid requests return `400 Bad Request`.

---

# Error Handling

The application uses NestJS HTTP exceptions together with a global exception filter.

Expected errors include:

```text
400 Bad Request
404 Not Found
500 Internal Server Error
```

Example validation response:

```json
{
  "message": [
    "page must not be less than 1",
    "limit must not be greater than 100"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Unexpected internal errors are returned as a safe `500` response without exposing internal database errors or implementation details.

---

# Database

The application uses:

```text
PostgreSQL
PostGIS
Prisma ORM
```

The primary relationship is:

```text
Agent
  |
  | 1:N
  |
Listing
```

Listings contain a PostGIS location representing the property's geographic position.

The database uses indexes appropriate for listing filters and geographic queries.

---

# Running Locally

## Prerequisites

- Node.js
- npm
- Docker
- Git

## 1. Clone the repository

```bash
git clone https://github.com/Veekta/property-listings-api.git
cd property-listings-api
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file with the required database connection settings.

Example:

```env
DATABASE_URL=your_database_connection_string
PORT=3000
```

Do not commit `.env` files or database credentials.

## 4. Start PostgreSQL/PostGIS

```bash
docker compose up -d
```

## 5. Run database migrations

Apply the project's Prisma database migrations using the configured Prisma workflow.

## 6. Start the API

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

Swagger will be available at:

```text
http://localhost:3000/api/docs
```

---

# Testing

## Unit Tests

Run:

```bash
npm run test
```

Current result:

```text
30 tests passing
```

The unit tests cover controllers, services, listing logic, and global exception handling.

## End-to-End Tests

Run:

```bash
npm run test:e2e
```

Current result:

```text
4 tests passing
```

The E2E tests use a dedicated test database/environment.

---

# Design Decisions

### PostgreSQL + PostGIS

PostgreSQL provides the relational database foundation while PostGIS provides geographic data types and database-level spatial queries.

### Prisma

Prisma provides the database access layer while keeping persistence concerns separate from the HTTP layer.

### Modular Monolith

The application uses a modular monolith because the scope of the task does not justify the operational complexity of microservices.

### Database-Level Geospatial Queries

Geospatial distance calculations are performed by PostGIS rather than by retrieving all listings into Node.js.

### Pagination

Collection responses are paginated with a maximum page size of 100 to avoid unbounded result sets.

### Response Mapping

Database records are mapped into API response objects so internal database representations such as PostGIS geometry are not exposed directly to API consumers.

### API Versioning

All public routes use `/api/v1`, providing a path for future API versions without immediately breaking existing consumers.

---

# Future Improvements

With additional development time, the following could be introduced:

- Authentication and authorization
- Role-based access control
- Agent management
- Property image uploads
- Object storage
- Favorites and saved searches
- Notifications
- Redis caching
- Dedicated search infrastructure such as Elasticsearch/OpenSearch
- Rate limiting
- Structured production logging
- Monitoring and observability
- CI/CD
- Cloud deployment
- Performance and load testing
- More extensive integration testing

These features are intentionally outside the scope of the initial implementation.

---

# Project Documentation

Additional technical documentation is available in the `docs/` directory:


docs/
├── requirements.md
├── architecture.md
├── api-design.md
├── database-design.md


License
This project was developed as a technical assessment project.
````
