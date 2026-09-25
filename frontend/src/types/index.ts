export type Role = 'BUYER' | 'AGENT';
export type ListingType = 'RENT' | 'SALE';
export type PropertyStatus = 'AVAILABLE' | 'PENDING' | 'SOLD' | 'RENTED';
export type InquiryStatus = 'PENDING' | 'CONTACTED' | 'RESOLVED';
export type InteractionType = 'VIEW' | 'SAVE' | 'INQUIRY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Property {
  id: string;
  agentId: string;
  title: string;
  description: string;
  price: string | number;
  propertyType: string;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  city: string;
  state: string;
  address: string;
  latitude?: number;
  longitude?: number;
  imageUrls: string[];
  status: PropertyStatus;
  createdAt: string;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertyListResponse {
  properties: Property[];
  pagination: PaginationMeta;
}

export interface Inquiry {
  id: string;
  userId: string;
  propertyId: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  property?: Partial<Property>;
  user?: Partial<User>;
}

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: Property;
}

export interface RecommendedPropertyItem {
  property_id: string;
  score: number;
  match_percentage: number;
  reason: string;
  property: Property;
}

export interface RecommendationResponse {
  user_id?: string | null;
  strategy: 'personalized_hybrid' | 'cold_start_trending' | 'content_similarity' | 'cold_start_fallback';
  total: number;
  recommendations: RecommendedPropertyItem[];
}
