# Requirements

## 1. Project Overview

The Property Listings API is a RESTful backend service for creating, managing, and searching property listings.

The API will allow clients to:

- Create property listings
- Retrieve property listings
- Retrieve a single listing
- Update property listings
- Delete property listings
- Search listings using property type, price range, bedroom count, and geographical distance
- Paginate listing results

The API will be built with Node.js and TypeScript and will use PostgreSQL with PostGIS for persistent storage and geospatial queries.

---

## 2. Core Requirements

### 2.1 Property Listings

Each property listing must contain:

- Unique ID
- Title
- Price
- Property type
- Number of bedrooms
- Geographic location
  - Latitude
  - Longitude

- Agent ID
- Creation timestamp
- Last update timestamp

### 2.2 Property Types

The API must support the following listing types:

- `RENT`
- `SALE`
- `SHORTLET`

---

## 3. CRUD Requirements

The API must provide endpoints to:

### Create a listing

```http
POST /api/v1/listings
```

### Retrieve listings

```http
GET /api/v1/listings
```

### Retrieve a single listing

```http
GET /api/v1/listings/:id
```

### Update a listing

```http
PATCH /api/v1/listings/:id
```

### Delete a listing

```http
DELETE /api/v1/listings/:id
```

---

## 4. Search Requirements

The API must provide a search endpoint:

```http
GET /api/v1/listings/search
```

The search endpoint must support filtering by:

- Property type
- Minimum price
- Maximum price
- Number of bedrooms

It must also support geographical filtering using:

- Latitude
- Longitude
- Radius in kilometres

Example:

```http
GET /api/v1/listings/search?type=RENT&minPrice=1000000&maxPrice=5000000&bedrooms=3&latitude=6.5244&longitude=3.3792&radius=10
```

This should return listings matching the supplied filters and located within the specified radius.

Geospatial calculations should be performed by the database using PostGIS rather than retrieving all records and calculating distances inside the Node.js application.

---

## 5. Pagination Requirements

Listing and search endpoints must support pagination.

The API should support:

```text
page
limit
```

The API should return pagination metadata including:

- Current page
- Page size
- Total records
- Total pages
- Whether another page exists
- Whether a previous page exists

The API should define a sensible maximum page size to prevent excessively large database queries.

---

## 6. Input Validation

All client input must be validated before being processed.

Examples of validation rules include:

### Title

- Required
- String
- Minimum length
- Maximum length

### Price

- Required
- Positive number

### Type

Must be one of:

```text
RENT
SALE
SHORTLET
```

### Bedrooms

- Integer
- Greater than or equal to zero

### Latitude

Must be between:

```text
-90 and 90
```

### Longitude

Must be between:

```text
-180 and 180
```

### Radius

- Positive number
- Represented in kilometres at the API level

Invalid requests must return a consistent `400 Bad Request` response.

---

## 7. Error Handling

The API must provide consistent error responses.

Expected HTTP status codes include:

| Situation               | Status |
| ----------------------- | -----: |
| Successful request      |    200 |
| Resource created        |    201 |
| Successful deletion     |    204 |
| Invalid input           |    400 |
| Unauthorized request    |    401 |
| Forbidden request       |    403 |
| Resource not found      |    404 |
| Conflict                |    409 |
| Unexpected server error |    500 |

Internal database or application errors must not expose sensitive implementation details to API consumers.

---

## 8. Database Requirements

The application will use:

- PostgreSQL
- PostGIS
- Prisma

The database should contain at least:

### Agents

Stores property agent information.

### Listings

Stores property listing information.

There should be a relationship between agents and listings.

A single agent may have multiple listings.

```text
Agent 1 ─────────── * Listings
```

The listing location should use a PostGIS geographic point.

A spatial index should be created to support efficient radius searches.

---

## 9. API Versioning

All API endpoints should use versioning:

```text
/api/v1
```

This allows future API versions to be introduced without immediately breaking existing clients.

---

## 10. Testing Requirements

The project must include automated tests.

At minimum, tests should cover:

### Unit tests

- Listing creation
- Listing retrieval
- Listing update
- Listing deletion
- Listing-not-found behavior
- Search/filter logic

### Integration/E2E tests

- Creating a listing through HTTP
- Retrieving listings
- Updating a listing
- Deleting a listing
- Searching listings
- Validation failures
- Geospatial search

Tests should use a dedicated test database/environment rather than relying on a developer's local development data.

---

## 11. API Documentation

The API should provide OpenAPI/Swagger documentation.

The documentation should describe:

- Available endpoints
- Request parameters
- Request bodies
- Response structures
- Validation errors
- HTTP status codes
- Search parameters

---

## 12. Development Requirements

The project should use:

- TypeScript
- ESLint
- Prettier
- Environment variables
- Git
- Docker
- PostgreSQL
- Prisma
- Automated tests

Sensitive configuration must not be committed to Git.

An `.env.example` file should document required environment variables without containing actual secrets.

---

## 13. Deployment Requirements

The application should be deployable as a containerized Node.js application.

The deployment process should include:

1. Build the application
2. Run automated tests
3. Build the production Docker image
4. Configure production environment variables
5. Run database migrations
6. Start the production application
7. Verify API health

The exact production hosting provider may be selected later.

---

## 14. Non-Functional Requirements

The application should be designed with:

### Maintainability

Use clear module boundaries and separation of responsibilities.

### Reliability

Use validation, structured error handling, database constraints, and automated tests.

### Performance

Use appropriate database indexes and perform geospatial filtering at the database level.

### Security

Apply input validation, secure HTTP headers, appropriate CORS configuration, rate limiting, and secure secret management.

### Scalability

The application should be structured so that caching, background jobs, additional search infrastructure, and other capabilities can be introduced later without rewriting the entire system.

---

## 15. Out of Scope

The following features are intentionally outside the initial implementation:

- User authentication
- Authorization/RBAC
- Agent authentication
- Property image uploads
- Payments
- Favorites
- Saved searches
- Notifications
- Messaging
- Redis caching
- Elasticsearch/OpenSearch
- Advanced analytics
- Property recommendations

These may be considered future improvements.

---

## 16. Definition of Done

The project will be considered complete when:

- [ ] CRUD endpoints are implemented
- [ ] Search endpoint is implemented
- [ ] Geospatial radius search works
- [ ] Pagination is implemented
- [ ] Input validation is implemented
- [ ] Consistent error handling is implemented
- [ ] PostgreSQL/PostGIS is configured
- [ ] Database migrations are working
- [ ] Database indexes are configured
- [ ] Unit tests are implemented
- [ ] Integration/E2E tests are implemented
- [ ] Swagger documentation is available
- [ ] ESLint passes
- [ ] Prettier passes
- [ ] TypeScript compilation succeeds
- [ ] Docker setup works
- [ ] CI pipeline is configured
- [ ] Production build works
- [ ] README is complete
- [ ] Architecture and design decisions are documented
- [ ] Future improvements are documented
