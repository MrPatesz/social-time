import { z } from 'zod';
import { IdSchema } from './Utils';

export const StarsSchema = z.number().min(0.5).max(5);

export const MutateRatingSchema = z.object({
    stars: StarsSchema.step(0.5),
});

export const BasicRatingSchema = z.object({
    stars: StarsSchema,
    eventId: IdSchema,
    userId: z.string(),
});

export const AverageRatingSchema = z.object({
    count: z.number().int().nonnegative(),
    averageStars: StarsSchema.nullable(),
});

export type BasicRatingType = z.infer<typeof BasicRatingSchema>;

export type AverageRatingType = z.infer<typeof AverageRatingSchema>;
