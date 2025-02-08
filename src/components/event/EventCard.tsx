import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import { BasicEventType } from '../../models/Event';
import { EventStatus, ThemeColor } from '../../utils/enums';
import { useShortDateFormatter } from '../../utils/formatters';
import { formatDistance, getBackgroundColor } from '../../utils/utilFunctions';
import { UserBadge } from '../user/UserBadge';
import { GroupBadge } from '../group/GroupBadge';
import { useMyRouter } from '../../hooks/useMyRouter';

export const EventCard: FunctionComponent<{
    event: BasicEventType;
}> = ({ event }) => {
    const { locale } = useMyRouter();
    const { t } = useTranslation('common');
    const shortDateFormatter = useShortDateFormatter();

    return (
        <Link
            href={`/events/${event.id}`}
            locale={locale}
            passHref
        >
            <Card
                withBorder
                sx={(theme) => ({
                    height: '100%',
                    ':hover': {
                        backgroundColor: getBackgroundColor(theme),
                    },
                })}
            >
                <Stack
                    spacing="xs"
                    justify="space-between"
                    h="100%"
                >
                    <Stack spacing="xs">
                        <Group
                            position="apart"
                            spacing="xs"
                        >
                            <Text
                                weight="bold"
                                size="lg"
                            >
                                {event.name}
                            </Text>
                            <Badge
                                color={
                                    event.status === EventStatus.PLANNED ?
                                        ThemeColor.GREEN
                                    :   ThemeColor.RED
                                }
                                variant="dot"
                            >
                                {shortDateFormatter.format(event.start)}
                            </Badge>
                        </Group>
                        <Group position="apart">
                            <Group spacing="xs">
                                {!event.price && (
                                    <Badge
                                        color="green"
                                        variant="light"
                                    >
                                        {t('common.free')}
                                    </Badge>
                                )}
                                {event.limit && (
                                    <Badge
                                        color="red"
                                        variant="light"
                                    >
                                        {t('filterEvents.limited')}
                                    </Badge>
                                )}
                            </Group>
                            {event.distance !== undefined && (
                                <Badge
                                    variant="outline"
                                    color="gray"
                                >
                                    {formatDistance(event.distance)}
                                </Badge>
                            )}
                        </Group>
                    </Stack>
                    <Group
                        position={event.group ? 'apart' : 'right'}
                        spacing="xs"
                    >
                        {event.group && <GroupBadge group={event.group} />}
                        <UserBadge user={event.creator} />
                    </Group>
                </Stack>
            </Card>
        </Link>
    );
};
