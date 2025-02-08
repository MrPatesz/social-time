import { useRouter } from 'next/router';
import { z } from 'zod';

export const usePathId = <T extends string | number>() => {
    const {
        query: { id },
        isReady,
    } = useRouter();

    return isReady ?
            {
                isReady,
                id: z
                    .string()
                    .min(1)
                    .pipe(z.union([z.coerce.number().min(1), z.string()]))
                    .parse(id) as T,
            }
        :   {
                isReady,
                id: null,
            };
};
