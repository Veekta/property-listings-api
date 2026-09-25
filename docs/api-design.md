# API Design

## 1. Overview

The Property Listings API exposes a versioned REST API for creating, retrieving, and searching property listings.

The API is versioned under:

```text
/api/v1
```

The API uses JSON for request and response payloads unless otherwise specified.

### Current implementation status

The API currently implements:

- Listing creation
- Paginated listing retrieval
- Listing filtering
- Geospatial radius filtering
- Request validation
- PostgreSQL/PostGIS-backed persistence

The following endpoints are part of the planned API contract but are not yet implemented:

- Retrieve a single listing
- Update a listing
- Delete a listing
- Dedicated search endpoint

---

## 2. Base URL

### Development

```text
http://localhost:3000/api/v1
```

### Production

```text
TBD
```

The production base URL will be defined when the deployment environment is selected.

---

## 3. Listing Endpoints

### Current endpoints

| Method | Endpoint           | Status      | Purpose                                                          |
| ------ | ------------------ | ----------- | ---------------------------------------------------------------- |
| POST   | `/listings`        | Implemented | Create a listing                                                 |
| GET    | `/listings`        | Implemented | Retrieve paginated listings and apply filters                    |
| GET    | `/listings/:id`    | Planned     | Retrieve a single listing                                        |
| PATCH  | `/listings/:id`    | Planned     | Partially update a listing                                       |
| DELETE | `/listings/:id`    | Planned     | Delete a listing                                                 |
| GET    | `/listings/search` | Planned     | Dedicated search endpoint if separated from collection retrieval |

### Current complete endpoint paths

```text
POST /api/v1/listings
GET  /api/v1/listings
```

### Planned endpoint paths

```text
GET    /api/v1/listings/:id
PATCH  /api/v1/listings/:id
DELETE /api/v1/listings/:id
GET    /api/v1/listings/search
```

---

# 4. Listing Resource

A listing contains:

```json
{
  "id": "uuid",
  "title": "Three Bedroom Apartment",
  "price": 5000000,
  "type": "SALE",
  "bedrooms": 3,
  "latitude": 6.5244,
  "longitude": 3.3792,
  "agentId": "uuid",
  "createdAt": "2026-09-25 15:53:20.484183+00",
  "updatedAt": "2026-09-25 15:53:20.381+00"
}
```

### Fields

| Field       | Type    | Description                   |
| ----------- | ------- | ----------------------------- |
| `id`        | string  | Unique listing identifier     |
| `title`     | string  | Listing title                 |
| `price`     | number  | Listing price                 |
| `type`      | enum    | `RENT`, `SALE`, or `SHORTLET` |
| `bedrooms`  | integer | Number of bedrooms            |
| `latitude`  | number  | Latitude of the listing       |
| `longitude` | number  | Longitude of the listing      |
| `agentId`   | string  | ID of the listing agent       |
| `createdAt` | string  | Creation timestamp            |
| `updatedAt` | string  | Last modification timestamp   |

### Location representation

The API exposes geographic coordinates as:

```json
{
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

Internally, the database stores the location using a PostGIS geometry column with SRID 4326.

The API does not expose the internal PostGIS geometry representation.

---

# 5. Create Listing

## Request

```http
POST /api/v1/listings
Content-Type: application/json
```

### Request body

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

### Request fields

| Field       | Type    | Required | Validation                 |
| ----------- | ------- | -------: | -------------------------- |
| `title`     | string  |      Yes | 3–200 characters           |
| `price`     | number  |      Yes | Must be greater than 0     |
| `type`      | enum    |      Yes | `RENT`, `SALE`, `SHORTLET` |
| `bedrooms`  | integer |      Yes | Must be ≥ 0                |
| `latitude`  | number  |      Yes | -90 to 90                  |
| `longitude` | number  |      Yes | -180 to 180                |
| `agentId`   | string  |      Yes | Valid UUID                 |

## Response

```http
201 Created
```

The current implementation returns the created database representation, including the PostGIS location object.

Example:

```json
{
  "agentId": "550e8400-e29b-41d4-a716-446655440000",
  "bedrooms": 3,
  "createdAt": "2026-09-25 15:53:20.484183+00",
  "id": "3018bfae-06c2-4095-bd8a-e5d72621b2c6",
  "location": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244],
    "srid": 4326
  },
  "price": "5000000",
  "title": "Three Bedroom Apartment",
  "type": "SALE",
  "updatedAt": "2026-09-25 15:53:20.381+00"
}
```

> The create response will be aligned with the public listing response mapper in a future refinement so that clients receive a consistent representation of listing resources.

---

# 6. Retrieve Listings

## Request

```http
GET /api/v1/listings
```

The endpoint returns a paginated collection of listings.

The endpoint supports pagination, property filters, and geospatial radius filtering.

---

## Query Parameters

### Pagination

| Parameter | Type    | Required | Default | Description                |
| --------- | ------- | -------: | ------: | -------------------------- |
| `page`    | integer |       No |     `1` | Page number                |
| `limit`   | integer |       No |    `20` | Number of records per page |
|           |         |          |         | Maximum: `100`             |

Example:

```http
GET /api/v1/listings?page=1&limit=20
```

---

## Property Filters

### `type`

Filters listings by listing type.

Accepted values:

```text
RENT
SALE
SHORTLET
```

Example:

```http
GET /api/v1/listings?type=SALE
```

### `minPrice`

Returns listings whose price is greater than or equal to the supplied value.

Example:

```http
GET /api/v1/listings?minPrice=4000000
```

### `maxPrice`

Returns listings whose price is less than or equal to the supplied value.

Example:

```http
GET /api/v1/listings?maxPrice=6000000
```

### `bedrooms`

Returns listings matching the supplied number of bedrooms.

Example:

```http
GET /api/v1/listings?bedrooms=3
```

### Combining property filters

Filters can be combined.

Example:

```http
GET /api/v1/listings?type=SALE&minPrice=4000000&maxPrice=6000000&bedrooms=3
```

When multiple filters are supplied, a listing must satisfy all supplied conditions.

---

# 7. Geospatial Listing Search

Geospatial filtering is performed directly by PostgreSQL/PostGIS.

The API accepts a geographic point and a radius.

## Query Parameters

| Parameter   | Type   | Required | Description                 |
| ----------- | ------ | -------: | --------------------------- |
| `latitude`  | number |     Yes* | Latitude of search point    |
| `longitude` | number |     Yes* | Longitude of search point   |
| `radius`    | number |     Yes* | Search radius in kilometres |

\* The three parameters must be supplied together.

### Example

```http
GET /api/v1/listings?latitude=6.5244&longitude=3.3792&radius=10
```

This means:

> Return listings located within 10 kilometres of latitude `6.5244` and longitude `3.3792`.

### Radius unit

The API accepts `radius` in kilometres.

The application converts the supplied value to metres before performing the database-level geographic distance comparison.

For example:

```text
10 km
↓
10,000 metres
```

### Geospatial processing

The application uses PostGIS `ST_DistanceSphere` through the Prisma PostgreSQL query layer.

The distance calculation is performed by PostgreSQL/PostGIS rather than loading all listings into Node.js and calculating distances in application code.

### Required parameters

The following request is invalid:

```http
GET /api/v1/listings?radius=10
```

The API requires:

```text
latitude
longitude
radius
```

to be supplied together.

Example error:

```json
{
  "message": "latitude, longitude, and radius must be provided together",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

# 8. Combined Listing Search

Property filters and geographic filters can be combined on the same endpoint.

Example:

```http
GET /api/v1/listings?type=SALE&minPrice=4000000&maxPrice=6000000&bedrooms=3&latitude=6.5244&longitude=3.3792&radius=10
```

The request means:

```text
type       = SALE
minPrice   = 4,000,000
maxPrice   = 6,000,000
bedrooms   = 3
latitude   = 6.5244
longitude  = 3.3792
radius     = 10 km
```

A listing must satisfy all supplied filters.

---

# 9. Retrieve Listings Response

## Successful response

```http
200 OK
```

### Example

```json
{
  "data": [
    {
      "id": "listing-uuid",
      "title": "Three Bedroom Apartment",
      "price": 5000000,
      "type": "SALE",
      "bedrooms": 3,
      "latitude": 6.5244,
      "longitude": 3.3792,
      "agentId": "agent-uuid",
      "createdAt": "2026-09-25 15:53:20.484183+00",
      "updatedAt": "2026-09-25 15:53:20.381+00"
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

### Pagination metadata

| Field         | Type    | Description                    |
| ------------- | ------- | ------------------------------ |
| `page`        | integer | Current page                   |
| `limit`       | integer | Requested page size            |
| `total`       | integer | Total matching records         |
| `totalPages`  | integer | Total number of pages          |
| `hasNext`     | boolean | Whether another page exists    |
| `hasPrevious` | boolean | Whether a previous page exists |

---

# 10. Retrieve Single Listing

> **Status: Planned**

## Request

```http
GET /api/v1/listings/:id
```

Example:

```http
GET /api/v1/listings/550e8400-e29b-41d4-a716-446655440000
```

## Successful response

```http
200 OK
```

The response will contain the requested listing resource.

## Not found

```http
404 Not Found
```

Example target error structure:

```json
{
  "statusCode": 404,
  "code": "LISTING_NOT_FOUND",
  "message": "Listing not found"
}
```

---

# 11. Update Listing

> **Status: Planned**

The API uses `PATCH` because listing updates are partial.

## Request

```http
PATCH /api/v1/listings/:id
Content-Type: application/json
```

Example:

```json
{
  "price": 5500000,
  "bedrooms": 4
}
```

Only supplied fields should be modified.

## Successful response

```http
200 OK
```

The response will contain the updated listing.

---

# 12. Delete Listing

> **Status: Planned**

## Request

```http
DELETE /api/v1/listings/:id
```

## Successful response

```http
204 No Content
```

A successful deletion does not return a response body.

## Not found

```http
404 Not Found
```

---

# 13. Dedicated Search Endpoint

> **Status: Planned / Not currently implemented**

The original API design included:

```http
GET /api/v1/listings/search
```

with support for:

```text
type
minPrice
maxPrice
bedrooms
latitude
longitude
radius
page
limit
```

However, the current implementation applies these filters directly to:

```http
GET /api/v1/listings
```

Therefore, the current API contract uses the collection endpoint for both listing retrieval and filtered/geospatial search.

A dedicated `/listings/search` endpoint may be introduced later if there is a clear need to separate collection retrieval from complex search operations.

---

# 14. Validation

All incoming request data must be validated before reaching business logic.

## Create Listing validation

Validation includes:

- Required fields
- String type
- Title minimum length
- Title maximum length
- Positive price
- Integer bedroom count
- Non-negative bedroom count
- Listing type enum
- Latitude range
- Longitude range
- UUID agent ID

### Title

```text
Minimum: 3 characters
Maximum: 200 characters
```

### Price

```text
Must be greater than 0
```

### Bedrooms

```text
Must be an integer
Must be greater than or equal to 0
```

### Latitude

```text
Minimum: -90
Maximum: 90
```

### Longitude

```text
Minimum: -180
Maximum: 180
```

### Radius

```text
Must be greater than 0
```

### Pagination

```text
page >= 1
limit >= 1
limit <= 100
```

Invalid requests are rejected with:

```http
400 Bad Request
```

---

# 15. Error Response

The API should return predictable HTTP error responses.

Validation errors currently originate from NestJS's global `ValidationPipe`.

Example:

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

Application-level validation can also return a specific message.

Example:

```json
{
  "message": "latitude, longitude, and radius must be provided together",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Planned standardized error format

The API may later introduce a centralized exception filter with a consistent structure such as:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ],
  "timestamp": "2026-09-25T12:00:00.000Z",
  "path": "/api/v1/listings"
}
```

Internal implementation details, database errors, stack traces, and sensitive information must not be exposed to API consumers.

---

# 16. HTTP Status Codes

| Status | Meaning                       |
| ------ | ----------------------------- |
| `200`  | Successful request            |
| `201`  | Resource created              |
| `204`  | Resource deleted successfully |
| `400`  | Invalid request               |
| `404`  | Resource not found            |
| `409`  | Resource conflict             |
| `500`  | Unexpected server error       |
| `503`  | Service unavailable           |

Authentication-related status codes such as `401` and `403` are reserved for future authentication and authorization functionality.

---

# 17. API Design Principles

The API follows these principles.

## Resource-oriented URLs

Endpoints represent resources rather than actions.

Preferred:

```text
POST /listings
```

Instead of:

```text
POST /createListing
```

## HTTP methods represent operations

```text
POST    Create
GET     Retrieve
PATCH   Partially update
DELETE  Delete
```

## Versioning

All public endpoints are versioned under:

```text
/api/v1
```

## Separation of concerns

Controllers handle HTTP concerns.

Services contain application and business logic.

The database layer handles persistence and database access.

## Database-level geospatial processing

Geospatial filtering is performed using PostgreSQL/PostGIS rather than application-level distance calculations.

The application converts API coordinates into a PostGIS point and delegates the distance calculation to the database.

## Pagination by default

Collection endpoints return paginated results rather than unbounded datasets.

The default page size is:

```text
20
```

with a maximum page size of:

```text
100
```

## Filter composition

Multiple filters can be combined.

For example:

```text
type
+
price range
+
bedrooms
+
geographic radius
```

All supplied filters must be satisfied.

## Consistent errors

The API uses HTTP status codes to communicate failure categories.

A centralized error response format is planned for a future quality/security milestone.
