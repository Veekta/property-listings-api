# API Design

## 1. Overview

The Property Listings API exposes a versioned REST API for creating, retrieving, updating, deleting, and searching property listings.

The API is versioned under:

```text
/api/v1
```

The API uses JSON for request and response payloads unless otherwise specified.

---

## 2. Base URL

Development:

```text
http://localhost:3000/api/v1
```

Production:

```text
TBD
```

The production base URL will be defined when the deployment environment is selected.

---

## 3. Listing Endpoints

| Method | Endpoint           | Purpose                       |
| ------ | ------------------ | ----------------------------- |
| POST   | `/listings`        | Create a listing              |
| GET    | `/listings`        | Retrieve paginated listings   |
| GET    | `/listings/:id`    | Retrieve a single listing     |
| PATCH  | `/listings/:id`    | Partially update a listing    |
| DELETE | `/listings/:id`    | Delete a listing              |
| GET    | `/listings/search` | Search listings using filters |

The complete endpoint paths are therefore:

```text
POST   /api/v1/listings
GET    /api/v1/listings
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
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "agentId": "uuid",
  "createdAt": "2026-09-25T12:00:00.000Z",
  "updatedAt": "2026-09-25T12:00:00.000Z"
}
```

### Fields

| Field                | Type    | Description                   |
| -------------------- | ------- | ----------------------------- |
| `id`                 | string  | Unique listing identifier     |
| `title`              | string  | Listing title                 |
| `price`              | number  | Listing price                 |
| `type`               | enum    | `RENT`, `SALE`, or `SHORTLET` |
| `bedrooms`           | integer | Number of bedrooms            |
| `location.latitude`  | number  | Latitude                      |
| `location.longitude` | number  | Longitude                     |
| `agentId`            | string  | ID of the listing agent       |
| `createdAt`          | string  | Creation timestamp            |
| `updatedAt`          | string  | Last modification timestamp   |

---

# 5. Create Listing

## Request

```http
POST /api/v1/listings
Content-Type: application/json
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
  "agentId": "agent-uuid"
}
```

## Response

```http
201 Created
```

Example:

```json
{
  "id": "listing-uuid",
  "title": "Three Bedroom Apartment",
  "price": 5000000,
  "type": "SALE",
  "bedrooms": 3,
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "agentId": "agent-uuid",
  "createdAt": "2026-09-25T12:00:00.000Z",
  "updatedAt": "2026-09-25T12:00:00.000Z"
}
```

---

# 6. Retrieve Listings

## Request

```http
GET /api/v1/listings
```

The endpoint returns a paginated collection of listings.

### Query parameters

```text
page
limit
```

Example:

```http
GET /api/v1/listings?page=1&limit=20
```

## Response

```http
200 OK
```

Example:

```json
{
  "data": [
    {
      "id": "listing-uuid",
      "title": "Three Bedroom Apartment",
      "price": 5000000,
      "type": "SALE",
      "bedrooms": 3,
      "location": {
        "latitude": 6.5244,
        "longitude": 3.3792
      },
      "agentId": "agent-uuid",
      "createdAt": "2026-09-25T12:00:00.000Z",
      "updatedAt": "2026-09-25T12:00:00.000Z"
    }
  ],
  "pagination": {
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

# 7. Retrieve Single Listing

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

The response contains the requested listing resource.

## Not found

```http
404 Not Found
```

Example:

```json
{
  "statusCode": 404,
  "code": "LISTING_NOT_FOUND",
  "message": "Listing not found"
}
```

---

# 8. Update Listing

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

The response contains the updated listing.

---

# 9. Delete Listing

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

# 10. Search Listings

Search is exposed through a dedicated endpoint:

```http
GET /api/v1/listings/search
```

### Supported filters

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

Example:

```http
GET /api/v1/listings/search?type=RENT&minPrice=1000000&maxPrice=5000000&bedrooms=3&latitude=6.5244&longitude=3.3792&radius=10&page=1&limit=20
```

### Filter behavior

#### Type

Filters by listing type:

```text
RENT
SALE
SHORTLET
```

#### Price

`minPrice` defines the minimum accepted price.

`maxPrice` defines the maximum accepted price.

If both are supplied, listings must fall within the specified range.

#### Bedrooms

Filters listings by the specified bedroom count.

#### Geographical search

`latitude`, `longitude`, and `radius` are used to perform a radius-based search.

The API accepts the radius in kilometres.

Example:

```text
latitude=6.5244
longitude=3.3792
radius=10
```

This means:

> Return listings located within 10 kilometres of the supplied coordinates.

The distance calculation must be performed by PostgreSQL/PostGIS rather than by loading all listings into Node.js.

If `radius` is supplied, both latitude and longitude are required.

---

# 11. Search Response

Search results use the same pagination structure as the listing collection endpoint.

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

# 12. Validation

All incoming request data must be validated before reaching business logic.

Validation includes:

- Required fields
- String length
- Numeric values
- Integer values
- Enum values
- Latitude range
- Longitude range
- Positive radius
- Pagination values

The API should reject invalid input with:

```http
400 Bad Request
```

---

# 13. Error Response

The API should return a consistent error structure.

Example:

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

# 14. HTTP Status Codes

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

# 15. API Design Principles

The API follows these principles:

### Resource-oriented URLs

Endpoints represent resources rather than actions.

Preferred:

```text
POST /listings
```

Instead of:

```text
POST /createListing
```

### HTTP methods represent operations

```text
POST    Create
GET     Retrieve
PATCH   Partially update
DELETE  Delete
```

### Versioning

All public endpoints are versioned under:

```text
/api/v1
```

### Separation of concerns

Controllers handle HTTP concerns.

Services contain application/business logic.

The database layer handles persistence.

### Database-level geospatial processing

Geospatial filtering is performed using PostGIS rather than application-level distance calculations.

### Pagination by default

Collection endpoints return paginated results rather than unbounded datasets.

### Consistent errors

Errors follow a predictable response structure so clients can handle them consistently.
