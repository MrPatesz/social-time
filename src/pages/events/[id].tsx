import { Carousel } from '@mantine/carousel';
import { ActionIcon, Box, Flex, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { IconCameraPlus, IconPencil } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useEffect } from 'react';
import i18nConfig from '../../../next-i18next.config.mjs';
import { CenteredLoader } from '../../components/CenteredLoader';
import { CollapsibleCard } from '../../components/CollapsibleCard';
import { CommentsComponent } from '../../components/event/CommentsComponent';
import { EditEventForm } from '../../components/event/EditEventForm';
import { ModifyImagesDialog } from '../../components/event/ModifyImagesDialog';
import { ParticipantsComponent } from '../../components/event/ParticipantsComponent';
import { GroupBadge } from '../../components/group/GroupBadge';
import MapComponent from '../../components/location/MapComponent';
import { QueryComponent } from '../../components/QueryComponent';
import { RatingComponent } from '../../components/RatingComponent';
import { RichTextDisplay } from '../../components/rich-text/RichTextDisplay';
import { UserBadge } from '../../components/user/UserBadge';
import { useGeolocation } from '../../hooks/useGeolocation';
import { usePathId } from '../../hooks/usePathId';
import { api } from '../../utils/api';
import { EVENT_IMAGE_SIZE } from '../../utils/constants';
import { EventStatus, InvalidateEvent } from '../../utils/enums';
import { useLongDateFormatter, usePriceFormatter } from '../../utils/formatters';

export default function EventDetailsPage() {
    const longDateFormatter = useLongDateFormatter();
    const priceFormatter = usePriceFormatter();
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const { id: eventId, isReady } = usePathId<number>();
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const { location, loading } = useGeolocation();

    const queryContext = api.useContext();
    const eventQuery = api.event.getById.useQuery(
        {
            eventId: eventId!,
            location: location ?? null,
        },
        {
            enabled: isReady && !loading,
        }
    );
    const averageRatingQuery = api.rating.getAverageRatingForEvent.useQuery(eventId!, {
        enabled: isReady && eventQuery.data?.status === EventStatus.ARCHIVE,
    });
    const userRatingQuery = api.rating.getCallerRating.useQuery(eventId!, {
        enabled: isReady && eventQuery.data?.status === EventStatus.ARCHIVE,
    });
    const rate = api.rating.rate.useMutation({
        onSuccess: () => void userRatingQuery.refetch(),
    });

    useEffect(() => {
        if (isReady) {
            void queryContext.comment.getAllByEventId.prefetch(eventId);
            void queryContext.rating.getCallerRating.prefetch(eventId);
            void queryContext.rating.getAverageRatingForEvent.prefetch(eventId);
        }
    }, [isReady, eventId, queryContext]);

    return !isReady ?
            <CenteredLoader />
        :   <QueryComponent
                resourceName={t('resource.eventDetails')}
                query={eventQuery}
                eventInfo={{ event: InvalidateEvent.EventGetById, id: eventId }}
                // loading={participate.isLoading}
            >
                {eventQuery.data && (
                    <Stack h="100%">
                        <Group
                            position="apart"
                            align="start"
                        >
                            <Stack>
                                <Group>
                                    <Text
                                        weight="bold"
                                        size="xl"
                                    >
                                        {eventQuery.data.name}
                                    </Text>
                                    <UserBadge
                                        useLink
                                        user={eventQuery.data.creator}
                                    />
                                    {eventQuery.data.group && (
                                        <GroupBadge
                                            useLink
                                            group={eventQuery.data.group}
                                        />
                                    )}
                                </Group>
                                <Text>
                                    {longDateFormatter.formatRange(
                                        eventQuery.data.start,
                                        eventQuery.data.end
                                    )}
                                </Text>
                                {eventQuery.data.price && (
                                    <Group spacing="xs">
                                        <Text>{t('common.price')}:</Text>
                                        <Text weight="bold">
                                            {priceFormatter.format(eventQuery.data.price)}
                                        </Text>
                                    </Group>
                                )}
                                {eventQuery.data.status === EventStatus.ARCHIVE && (
                                    <QueryComponent
                                        resourceName={t('resource.rating')}
                                        query={averageRatingQuery}
                                        eventInfo={{
                                            event: InvalidateEvent.RatingGetAverageRatingForEvent,
                                            id: eventId,
                                        }}
                                        loading={rate.isLoading}
                                    >
                                        <RatingComponent
                                            averageRating={averageRatingQuery.data}
                                            previousRating={userRatingQuery.data}
                                            canRate={
                                                !(
                                                    eventQuery.data.creatorId ===
                                                        session?.user.id ||
                                                    !eventQuery.data.participants.find(
                                                        (p) => p.id === session?.user.id
                                                    )
                                                )
                                            }
                                            onChange={(value) =>
                                                rate.mutate({
                                                    createRating: { stars: value },
                                                    eventId,
                                                })
                                            }
                                        />
                                    </QueryComponent>
                                )}
                            </Stack>
                            <Stack align="end">
                                <ParticipantsComponent event={eventQuery.data} />
                                {eventQuery.data.creatorId === session?.user.id && (
                                    <Group spacing="xs">
                                        {eventQuery.data.status === EventStatus.PLANNED && (
                                            <ActionIcon
                                                title={t('modal.event.edit')}
                                                size="lg"
                                                variant="filled"
                                                color={theme.fn.themeColor(theme.primaryColor)}
                                                onClick={() =>
                                                    openModal({
                                                        title: t('modal.event.edit'),
                                                        children: (
                                                            <EditEventForm eventId={eventId} />
                                                        ),
                                                        fullScreen: !xs,
                                                    })
                                                }
                                            >
                                                <IconPencil />
                                            </ActionIcon>
                                        )}
                                        <ActionIcon
                                            title={t('eventDetails.modifyImages')}
                                            size="lg"
                                            variant="filled"
                                            color={theme.fn.themeColor(theme.primaryColor)}
                                            onClick={() =>
                                                openModal({
                                                    title: t('eventDetails.modifyImages'),
                                                    children: (
                                                        <ModifyImagesDialog
                                                            eventId={eventId}
                                                            location={location ?? null}
                                                        />
                                                    ),
                                                    fullScreen: !xs,
                                                    size: 3 * EVENT_IMAGE_SIZE + 4 * 16,
                                                })
                                            }
                                        >
                                            <IconCameraPlus />
                                        </ActionIcon>
                                    </Group>
                                )}
                            </Stack>
                        </Group>
                        {eventQuery.data.description && (
                            <CollapsibleCard label={t('eventForm.description.label')}>
                                <RichTextDisplay richText={eventQuery.data.description} />
                            </CollapsibleCard>
                        )}
                        <Flex
                            gap="md"
                            direction={md ? 'row' : 'column'}
                        >
                            {Boolean(eventQuery.data.images.length) && (
                                <Carousel
                                    height={EVENT_IMAGE_SIZE}
                                    w={EVENT_IMAGE_SIZE}
                                    loop
                                    withControls={false}
                                    withIndicators
                                >
                                    {eventQuery.data.images.map((image, index) => (
                                        <Carousel.Slide key={image}>
                                            <Image
                                                alt={`Image ${index + 1}`}
                                                width={EVENT_IMAGE_SIZE}
                                                height={EVENT_IMAGE_SIZE}
                                                src={image}
                                                style={{
                                                    borderRadius: theme.fn.radius(
                                                        theme.defaultRadius
                                                    ),
                                                }}
                                            />
                                        </Carousel.Slide>
                                    ))}
                                </Carousel>
                            )}
                            <Box sx={{ flexGrow: 1 }}>
                                <CommentsComponent />
                            </Box>
                        </Flex>
                        <Box sx={{ flexGrow: 1 }}>
                            <MapComponent
                                size={{ width: '100%', height: '100%', minHeight: 375 }}
                                location={eventQuery.data.location}
                                distance={eventQuery.data.distance}
                            />
                        </Box>
                    </Stack>
                )}
            </QueryComponent>;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
