type ListingLocation = {
  readonly type: string;
  readonly coordinates: readonly unknown[];
  readonly srid?: number;
};

type ListingForResponse = {
  id: string;
  title: string;
  price: string;
  type: 'RENT' | 'SALE' | 'SHORTLET';
  bedrooms: number;
  location: ListingLocation;
  agentId: string;
  createdAt: string;
  updatedAt: string;
};

export function mapListing(listing: ListingForResponse) {
  if (listing.location.type !== 'Point') {
    throw new Error('Listing location must be a Point');
  }

  const coordinates = listing.location.coordinates;

  if (coordinates.length < 2) {
    throw new Error('Listing location must contain latitude and longitude');
  }

  const longitude = coordinates[0];
  const latitude = coordinates[1];

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    throw new Error('Listing location must contain valid coordinates');
  }

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
