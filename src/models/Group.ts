import { z } from 'zod';
import { BasicUserSchema } from './User';
import { DescriptionSchema, IdSchema, NameSchema } from './Utils';
import { ThemeColor } from '../utils/enums';

export const MutateGroupSchema = z
    .object({
        name: NameSchema,
        description: DescriptionSchema,
        color1: z.nativeEnum(ThemeColor),
        color2: z.nativeEnum(ThemeColor),
        isPrivate: z.boolean(),
    })
    .refine((group) => group.color1 !== group.color2, {
        message: 'Group colors must be distinct',
    });

export const BasicGroupSchema = MutateGroupSchema.innerType().extend({
    id: IdSchema,
    createdAt: z.date(),
    creatorId: z.string(),
    creator: BasicUserSchema,
});

export const DetailedGroupSchema = BasicGroupSchema.extend({
    members: z.lazy(() => BasicUserSchema.array()),
});

export type CreateGroupType = z.infer<typeof MutateGroupSchema>;

export type BasicGroupType = z.infer<typeof BasicGroupSchema>;
