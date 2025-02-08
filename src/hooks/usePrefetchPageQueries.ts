import { useMantineTheme } from '@mantine/core';
import { useLocalStorage, useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '../components/event/EventTable';
import { api } from '../utils/api';
import dayjs from '../utils/dayjs';
import {
    SortCommentByProperty,
    SortDirection,
    SortEventByProperty,
    SortGroupByProperty,
} from '../utils/enums';
import { useAuthenticated } from './useAuthenticated';
import { useGeolocation } from './useGeolocation';

const getPaginatedInputBase = <
    SORT_BY_PROPERTY extends
        | SortEventByProperty
        | SortGroupByProperty
        | SortCommentByProperty
        | undefined,
>(
    sortByProperty: SORT_BY_PROPERTY,
    sortByDirection: 'asc' | 'desc' = 'desc'
) => ({
    searchQuery: '',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: {
        property: sortByProperty,
        direction: sortByDirection as SortDirection,
    },
});

export const usePrefetchPageQueries = () => {
    const { authenticated, user } = useAuthenticated();
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const { t } = useTranslation('common');
    const queryContext = api.useContext();

    // TODO object as const: LocalStorageKeys, DefaultValues
    const [includeArchive] = useLocalStorage<boolean>({
        key: 'include-archive',
        defaultValue: true,
    });
    const [myGroupsOnly] = useLocalStorage<boolean>({
        key: 'my-groups-only',
        defaultValue: false,
    });
    const [enableMaxDistance] = useLocalStorage<boolean>({
        key: 'enable-max-distance',
        defaultValue: false,
    });
    const [maxDistance] = useLocalStorage<number>({
        key: 'fluid-max-distance',
        defaultValue: 40,
    });
    const [zoom] = useLocalStorage({
        key: 'google-map-zoom',
        defaultValue: 12,
    });
    const mapMaxDistance = useMemo(() => {
        const increment =
            md ? 0
            : xs ? 0.5
            : 1;
        return 40000 / Math.pow(2, zoom + increment);
    }, [zoom, xs, md]);

    const { location } = useGeolocation(enableMaxDistance);

    useEffect(() => {
        if (authenticated) {
            if (!queryContext.group.getJoinedGroups.getData()) {
                void queryContext.group.getJoinedGroups.prefetch();
            }

            if (!queryContext.user.profile.getData()) {
                void queryContext.user.profile.prefetch();
            }

            const getPaginatedEventsInput1 = {
                ...getPaginatedInputBase('start' as SortEventByProperty),
                createdOnly: false,
                archive: false,
            };
            if (!queryContext.event.getPaginatedEvents.getData(getPaginatedEventsInput1)) {
                void queryContext.event.getPaginatedEvents.prefetch(getPaginatedEventsInput1);
            }

            const getPaginatedEventsInput2 = {
                ...getPaginatedInputBase('start' as SortEventByProperty),
                createdOnly: true,
                archive: false,
            };
            if (!queryContext.event.getPaginatedEvents.getData(getPaginatedEventsInput2)) {
                void queryContext.event.getPaginatedEvents.prefetch(getPaginatedEventsInput2);
            }

            const getPaginatedGroupsInput = {
                ...getPaginatedInputBase('createdAt' as SortGroupByProperty),
                createdOnly: false,
            };
            if (!queryContext.group.getPaginatedGroups.getData(getPaginatedGroupsInput)) {
                void queryContext.group.getPaginatedGroups.prefetch(getPaginatedGroupsInput);
            }

            const getPaginatedUsersInput = {
                ...getPaginatedInputBase(undefined),
                sortBy: { direction: 'asc' as SortDirection },
            };
            if (!queryContext.user.getPaginatedUsers.getData(getPaginatedUsersInput)) {
                void queryContext.user.getPaginatedUsers.prefetch(getPaginatedUsersInput);
            }

            const getAllCreatedInput = getPaginatedInputBase('postedAt' as SortCommentByProperty);
            if (!queryContext.comment.getAllCreated.getData(getAllCreatedInput)) {
                void queryContext.comment.getAllCreated.prefetch(getAllCreatedInput);
            }
        }
    }, [authenticated, queryContext]);

    useEffect(() => {
        if (authenticated) {
            if (!queryContext.event.getCalendar.getData()) {
                queryContext.event.getCalendar
                    .fetch()
                    .then((participatedEvents) => {
                        const upcomingEvents = participatedEvents.filter((event) => {
                            const difference = dayjs(event.start).diff(dayjs(), 'hours');
                            return 24 >= difference && difference >= 0;
                        });
                        const count = upcomingEvents.length;
                        if (count > 0) {
                            Notification.requestPermission()
                                .then((permission) => {
                                    if (permission === 'granted') {
                                        new Notification(t('application.name'), {
                                            body: t('application.upcomingEvents', {
                                                count,
                                                plural: count > 1 ? 's' : '',
                                            }),
                                            icon: '/icon-192x192.png',
                                            tag: 'upcoming_events',
                                        });
                                    }
                                })
                                .catch((error) => console.error(error));
                        }
                    })
                    .catch((error) => console.error(error));
            }
        }
    }, [authenticated, queryContext, t]);

    useEffect(() => {
        if (authenticated && location) {
            const input = {
                center: location,
                maxDistance: mapMaxDistance,
                includeArchive,
                myGroupsOnly,
            };
            if (!queryContext.event.getMap.getData(input)) {
                void queryContext.event.getMap.prefetch(input);
            }
        }
    }, [authenticated, queryContext, location, mapMaxDistance, includeArchive, myGroupsOnly]);

    useEffect(() => {
        if (authenticated) {
            const input = {
                includeArchive,
                myGroupsOnly,
                distanceFilter: {
                    maxDistance: location && enableMaxDistance ? maxDistance : null,
                    location: location ?? null,
                },
            };
            if (!queryContext.event.getFeed.getInfiniteData(input)) {
                void queryContext.event.getFeed.prefetchInfinite(input);
            }
        }
    }, [
        authenticated,
        queryContext,
        location,
        enableMaxDistance,
        maxDistance,
        includeArchive,
        myGroupsOnly,
    ]);

    useEffect(() => {
        if (authenticated) {
            if (!queryContext.rating.getAverageRatingForUser.getData(user.id)) {
                void queryContext.rating.getAverageRatingForUser.prefetch(user.id);
            }
        }
    }, [authenticated, queryContext, user?.id]);
};
