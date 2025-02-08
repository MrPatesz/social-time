import { z } from 'zod';
import { SortDirection, SortEventByProperty } from '../../utils/enums';
import { PaginateBaseSchema } from './PaginateBase';

export const PaginateEventsSchema = PaginateBaseSchema.extend({
    sortBy: z.object({
        property: z.nativeEnum(SortEventByProperty),
        direction: z.nativeEnum(SortDirection),
    }),
    createdOnly: z.boolean(),
    archive: z.boolean(),
});
