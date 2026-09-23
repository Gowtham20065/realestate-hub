import { z } from 'zod';
import { ListingType, PropertyStatus } from '@prisma/client';

export const propertyQuerySchema = z.object({
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  propertyType: z.string().trim().optional(),
  listingType: z.nativeEnum(ListingType).optional(),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.AVAILABLE).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().nonnegative().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'sqft_desc']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const createPropertySchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title must not exceed 150 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(20, 'Description must be at least 20 characters'),
  price: z.coerce.number({ required_error: 'Price is required' }).positive('Price must be greater than 0'),
  propertyType: z.string({ required_error: 'Property type is required' }).trim(),
  listingType: z.nativeEnum(ListingType, {
    errorMap: () => ({ message: 'Listing type must be RENT or SALE' }),
  }),
  bedrooms: z.coerce.number({ required_error: 'Bedrooms count is required' }).int().nonnegative('Bedrooms cannot be negative'),
  bathrooms: z.coerce.number({ required_error: 'Bathrooms count is required' }).nonnegative('Bathrooms cannot be negative'),
  sqft: z.coerce.number({ required_error: 'Square footage is required' }).int().positive('Square footage must be positive'),
  city: z.string({ required_error: 'City is required' }).trim().min(2),
  state: z.string({ required_error: 'State is required' }).trim().min(2),
  address: z.string({ required_error: 'Address is required' }).trim().min(5),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  imageUrls: z.array(z.string().url('Each image must be a valid URL')).default([]),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.AVAILABLE),
});

export const updatePropertySchema = createPropertySchema.partial();

export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
