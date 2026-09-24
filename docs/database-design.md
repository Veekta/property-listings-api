## Database Infrastructure

The application uses PostgreSQL as its primary relational database.

PostGIS is enabled to support geospatial functionality required by the
property search feature.

### Technology

- PostgreSQL
- PostGIS
- Prisma ORM

### Local Development

PostgreSQL and PostGIS are run using Docker Compose.

The local database configuration is:

- Database: `property_listings`
- User: `postgres`
- Port: `5432`

### Geospatial Data

Property locations will be stored as geographic points using
PostGIS with SRID 4326.

Coordinates follow the standard:

- Longitude
- Latitude

A spatial index will be used to improve radius-based property searches.

### Geospatial Search

The API will support searching for properties within a specified radius
from a latitude and longitude.

Geospatial filtering will be performed at the database level using
PostGIS rather than loading all records into the application layer.
