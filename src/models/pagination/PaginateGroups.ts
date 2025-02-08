import { z } from 'zod';
import { SortDirection, SortGroupByProperty } from '../../utils/enums';
import { PaginateBaseSchema } from './PaginateBase';

export const PaginateGroupsSchema = PaginateBaseSchema.extend({
    sortBy: z.object({
        property: z.nativeEnum(SortGroupByProperty),
        direction: z.nativeEnum(SortDirection),
    }),
    createdOnly: z.boolean(),
});
