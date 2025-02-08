import { z } from 'zod';
import { SortDirection } from '../../utils/enums';
import { PaginateBaseSchema } from './PaginateBase';

export const PaginateUsersSchema = PaginateBaseSchema.extend({
    sortBy: z.object({
        direction: z.nativeEnum(SortDirection),
    }),
});
