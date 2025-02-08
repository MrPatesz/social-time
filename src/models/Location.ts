import { z } from 'zod';
import { IdSchema } from './Utils';

export const CoordinatesSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

// TODO should not receive address, as this can be manipulated, do Reverse Geocoding instead:
//  https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse#maps_geocoding_reverse-typescript
export const MutateLocationSchema = CoordinatesSchema.extend({
    address: z.string().min(1),
});

export const LocationSchema = MutateLocationSchema.extend({
    id: IdSchema,
});

export type CoordinatesType = z.infer<typeof CoordinatesSchema>;

export type CreateLocationType = z.infer<typeof MutateLocationSchema>;

export type LocationType = z.infer<typeof LocationSchema>;
