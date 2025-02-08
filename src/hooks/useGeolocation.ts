import { useEffect, useState } from 'react';
import { CoordinatesSchema, CoordinatesType } from '../models/Location';
import { api } from '../utils/api';

export const useGeolocation = (enableGeolocation = true) => {
    const [geolocation, setGeolocation] = useState<CoordinatesType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const profileQuery = api.user.profile.useQuery();

    useEffect(() => {
        if (!enableGeolocation) {
            return;
        }

        void (async () => {
            try {
                const { state } = await window.navigator.permissions.query({
                    name: 'geolocation',
                });

                if (state === 'denied') {
                    return;
                }

                window.navigator.geolocation.getCurrentPosition(
                    ({ coords: { longitude, latitude } }) =>
                        setGeolocation({
                            longitude,
                            latitude,
                        })
                );
            } catch (_) {
            } finally {
                setIsLoading(false);
            }
        })();
    }, [enableGeolocation]);

    const result = CoordinatesSchema.safeParse(geolocation ?? profileQuery.data?.location);
    const loading = isLoading || profileQuery.isLoading;

    if (result.success) {
        return { loading: false, location: result.data };
    } else if (loading) {
        return { loading };
    } else {
        return { loading, error: true };
    }
};
