import { z } from 'zod';
import { ThemeColor } from '../utils/enums';
import { BasicEventSchema } from './Event';
import { LocationSchema, MutateLocationSchema } from './Location';
import { DescriptionSchema, ImageSchema, NameSchema } from './Utils';

export const BasicUserSchema = z.object({
    id: z.string().min(1),
    name: NameSchema,
    introduction: DescriptionSchema,
    themeColor: z.nativeEnum(ThemeColor),
    image: ImageSchema,
});

export const DetailedUserSchema = BasicUserSchema.extend({
    createdEvents: z.lazy(() => BasicEventSchema.array()),
    participatedEvents: z.lazy(() => BasicEventSchema.array()),
    // createdGroups: z.lazy(() => BasicGroupSchema.array()),
    // joinedGroups: z.lazy(() => BasicGroupSchema.array()),
});

export const UpdateProfileSchema = BasicUserSchema.extend({
    location: MutateLocationSchema.nullable(),
});

export const ProfileSchema = BasicUserSchema.extend({
    location: LocationSchema.nullable(),
    // email: z.string(),
});

export type BasicUserType = z.infer<typeof BasicUserSchema>;

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;

export type ProfileType = z.infer<typeof ProfileSchema>;
