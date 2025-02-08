import { z } from 'zod';
import { BasicUserSchema } from './User';
import { IdSchema } from './Utils';

export const QueryJoinRequestSchema = z.object({
    groupId: IdSchema,
});

export const MutateJoinRequestSchema = QueryJoinRequestSchema.extend({
    join: z.boolean(),
});

export const JoinRequestSchema = QueryJoinRequestSchema.extend({
    createdAt: z.date(),
    userId: z.string().min(1),
    user: BasicUserSchema,
});

export const AcceptJoinRequestSchema = QueryJoinRequestSchema.extend({
    userId: z.string().min(1),
    accept: z.boolean(),
});
