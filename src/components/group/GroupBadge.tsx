import { FunctionComponent, MouseEventHandler } from 'react';
import { Badge, Group, Text } from '@mantine/core';
import { IconStarFilled } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { api } from '../../utils/api';
import { usePusher } from '../../hooks/usePusher';
import { InvalidateEvent } from '../../utils/enums';
import { BasicGroupType } from '../../models/Group';
import Link from 'next/link';
import { useMyRouter } from '../../hooks/useMyRouter';

export const GroupBadge: FunctionComponent<{
    group: BasicGroupType;
    useLink?: boolean;
}> = ({ group, useLink = false }) => {
    const { locale, pushRoute, localePrefix } = useMyRouter();
    const { t } = useTranslation('common');

    // TODO don't do this for all events on FeedPage
    const groupRatingQuery = api.rating.getAverageRatingForGroup.useQuery(group.id, {
        enabled: Boolean(group.id),
    });
    usePusher(
        {
            event: InvalidateEvent.RatingGetAverageRatingForGroup,
            id: group.id,
        },
        () => void groupRatingQuery.refetch()
    );

    const getBadge = (onClicks?: {
        onClick: MouseEventHandler<HTMLDivElement>;
        onAuxClick: MouseEventHandler<HTMLDivElement>;
    }) => (
        <Badge
            onClick={onClicks?.onClick}
            onAuxClick={onClicks?.onAuxClick}
            title={t('myEvents.group')}
            variant="gradient"
            gradient={{ from: group.color1, to: group.color2 }}
            sx={{ display: 'flex' }}
            rightSection={
                !!groupRatingQuery.data?.count && (
                    <Group spacing={2}>
                        <Text>{groupRatingQuery.data.averageStars?.toFixed(1)}</Text>
                        <IconStarFilled size={10} />
                    </Group>
                )
            }
        >
            {group.name}
        </Badge>
    );

    const href = `/groups/${group.id}`;

    return useLink ?
            <Link
                href={href}
                locale={locale}
                passHref
            >
                {getBadge()}
            </Link>
        :   getBadge({
                onClick: (e) => {
                    e.preventDefault();
                    void pushRoute(href, undefined, { locale });
                },
                onAuxClick: (e) => {
                    e.preventDefault();
                    window.open(`${localePrefix}${href}`);
                },
            });
};
