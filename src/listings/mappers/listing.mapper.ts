import type { Geometry } from '@prisma/orm-extension-postgis/geojson';

export function mapListing(listing: {
  id: string;
  title: string;
  price: string;
  type: 'RENT' | 'SALE' | 'SHORTLET';
  bedrooms: number;
  location: Geometry;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}) {
  if (listing.location.type !== 'Point') {
    throw new Error('Listing location must be a Point');
  }

  const [longitude, latitude] = listing.location.coordinates;

  return {
    id: listing.id,
    title: listing.title,
    price: Number(listing.price),
    type: listing.type,
    bedrooms: listing.bedrooms,
    latitude,
    longitude,
    agentId: listing.agentId,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}
