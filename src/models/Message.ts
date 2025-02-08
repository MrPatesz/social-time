import { z } from 'zod';
import { BasicUserSchema } from './User';
import { IdSchema, TextSchema } from './Utils';

export const CreateMessageSchema = z.object({
    text: TextSchema,
});

export const BasicMessageSchema = CreateMessageSchema.extend({
    id: IdSchema,
    postedAt: z.date(),
    groupId: IdSchema,
    userId: z.string(),
    user: BasicUserSchema,
});

export type CreateMessageType = z.infer<typeof CreateMessageSchema>;

export type BasicMessageType = z.infer<typeof BasicMessageSchema>;
