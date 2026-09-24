## Architecture Overview

The Property Listings API will use a modular layered architecture.

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
Repository / Data Access
   |
   v
Prisma
   |
   v
PostgreSQL + PostGIS
```

## 2. Application Layer

### Controllers

Controllers are responsible for:

- Receiving HTTP requests
- Returning HTTP responses
- Mapping HTTP input to application operations
- Delegating business operations to services

Controllers should not contain complex business logic or direct database operations.

### Services

Services contain application and business logic.

Examples include:

- Creating listings
- Updating listings
- Searching listings
- Validating business-level conditions
- Coordinating database operations

### Data Access

Database operations should be isolated from HTTP concerns.

Prisma will be used as the primary database access layer.

Raw SQL may be used where necessary for PostgreSQL/PostGIS functionality that is not adequately represented by the ORM.

---

## 3. Database Architecture

PostgreSQL will be used as the primary relational database.

PostGIS will provide geospatial functionality.

The primary entities are:

```text
Agent
  |
  | 1:N
  |
Listing
```

Listings will contain a geographic point representing the property's location.

A spatial index will support radius-based searches.

---

## 4. API Architecture

API routes will be versioned:

```text
/api/v1
```

Listing endpoints:

```text
POST   /api/v1/listings
GET    /api/v1/listings
GET    /api/v1/listings/:id
PATCH  /api/v1/listings/:id
DELETE /api/v1/listings/:id
GET    /api/v1/listings/search
```

---

## 5. Validation

Request validation will occur before business logic is executed.

Invalid requests should return structured validation errors.

Validation will cover:

- Required fields
- Data types
- Enum values
- Numeric ranges
- Coordinates
- Pagination parameters
- Search parameters

---

## 6. Error Handling

The application will use centralized error handling.

Application errors should be converted into consistent HTTP responses.

Internal implementation details should not be exposed to clients.

---

## 7. Testing Architecture

Testing will be divided into:

### Unit tests

Used to test isolated application logic.

### Integration/E2E tests

Used to test the API through HTTP and verify interaction with the database.

A dedicated test database/environment should be used.

---

## 8. Infrastructure

Local development will use Docker for PostgreSQL/PostGIS.

The application itself will be containerized for production deployment.

Environment-specific configuration will be supplied through environment variables.

---

## 9. Future Architecture Considerations

The initial application will remain a modular monolith.

If the system grows significantly, the architecture could later introduce:

- Redis
- Background workers
- Message queues
- Dedicated search infrastructure
- Object storage
- Observability infrastructure
- Authentication services
- Additional API services

These are intentionally excluded from the initial implementation.
