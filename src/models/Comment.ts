import { z } from 'zod';
import { BasicEventSchema } from './Event';
import { BasicUserSchema } from './User';
import { IdSchema, TextSchema } from './Utils';

export const MutateCommentSchema = z.object({
    text: TextSchema,
});

export const BasicCommentSchema = MutateCommentSchema.extend({
    id: IdSchema,
    postedAt: z.date(),
    eventId: IdSchema,
    userId: z.string(),
    user: BasicUserSchema,
});

export const DetailedCommentSchema = BasicCommentSchema.omit({ user: true }).extend({
    event: z.lazy(() => BasicEventSchema.innerType().pick({ id: true, name: true })),
});

export type MutateCommentType = z.infer<typeof MutateCommentSchema>;

export type BasicCommentType = z.infer<typeof BasicCommentSchema>;

export type DetailedCommentType = z.infer<typeof DetailedCommentSchema>;
