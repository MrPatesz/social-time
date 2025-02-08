import {
    ActionIcon,
    Box,
    Card,
    Group,
    ScrollArea,
    Stack,
    Text,
    useMantineTheme,
} from '@mantine/core';
import { useIntersection, useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { BasicEventType } from '../../models/Event';
import { api } from '../../utils/api';
import { InvalidateEvent } from '../../utils/enums';
import { getBackgroundColor } from '../../utils/utilFunctions';
import { CenteredLoader } from '../CenteredLoader';
import { CreateEventForm } from '../event/CreateEventForm';
import { EventCard } from '../event/EventCard';
import { QueryComponent } from '../QueryComponent';
import { IntervalRecommender } from './IntervalRecommender';

export const GroupFeed: FunctionComponent<{
    groupId: number;
}> = ({ groupId }) => {
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const { t } = useTranslation('common');
    const { ref, entry } = useIntersection({ threshold: 0.1 });

    const eventsQuery = api.event.getFeed.useInfiniteQuery(
        { groupId },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    useEffect(() => {
        if (entry?.isIntersecting && eventsQuery.hasNextPage && !eventsQuery.isFetching) {
            void eventsQuery.fetchNextPage();
        }
    }, [entry]);

    const events: BasicEventType[] = useMemo(() => {
        return eventsQuery.data?.pages.flatMap((page) => page.events) ?? [];
    }, [eventsQuery.data?.pages]);

    return (
        <QueryComponent
            resourceName={t('resource.feed')}
            query={eventsQuery}
            eventInfo={{ event: InvalidateEvent.EventGetFeed, id: groupId }}
        >
            <Card
                withBorder
                sx={(theme) => ({ backgroundColor: getBackgroundColor(theme) })}
            >
                <Stack>
                    <Group position="apart">
                        <Text color="dimmed">{t('resource.events')}</Text>
                        <Group spacing="xs">
                            <IntervalRecommender groupId={groupId} />
                            <ActionIcon
                                title={t('modal.event.create')}
                                size={36}
                                variant="filled"
                                color={theme.fn.themeColor(theme.primaryColor)}
                                onClick={() =>
                                    openModal({
                                        title: t('modal.event.create'),
                                        children: <CreateEventForm initialGroupId={groupId} />,
                                        fullScreen: !xs,
                                    })
                                }
                            >
                                <IconPlus />
                            </ActionIcon>
                        </Group>
                    </Group>
                    {!!events.length && (
                        <ScrollArea>
                            <Stack sx={{ maxHeight: 400 }}>
                                {events.map((event, index) => (
                                    <Box
                                        ref={index === events.length - 1 ? ref : undefined}
                                        key={event.id}
                                    >
                                        <EventCard event={event} />
                                    </Box>
                                ))}
                                {eventsQuery.isFetching && <CenteredLoader />}
                            </Stack>
                        </ScrollArea>
                    )}
                </Stack>
            </Card>
        </QueryComponent>
    );
};
