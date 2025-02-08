import { z } from 'zod';

export const PaginateBaseSchema = z.object({
    page: z.number().min(1),
    pageSize: z.number().min(5).max(50),
    searchQuery: z.string(),
});
