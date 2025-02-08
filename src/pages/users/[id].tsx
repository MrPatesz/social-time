import { Box, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../../next-i18next.config.mjs';
import { EventGrid } from '../../components/event/EventGrid';
import { QueryComponent } from '../../components/QueryComponent';
import { RatingComponent } from '../../components/RatingComponent';
import { RichTextDisplay } from '../../components/rich-text/RichTextDisplay';
import UserImage from '../../components/user/UserImage';
import { api } from '../../utils/api';
import { InvalidateEvent } from '../../utils/enums';
import { usePathId } from '../../hooks/usePathId';
import { CenteredLoader } from '../../components/CenteredLoader';

export default function UserDetailsPage() {
    const { id: userId, isReady } = usePathId<string>();
    const { t } = useTranslation('common');

    const userDetailsQuery = api.user.getById.useQuery(userId!, {
        enabled: isReady,
    });
    const userRatingQuery = api.rating.getAverageRatingForUser.useQuery(userId!, {
        enabled: isReady,
    });

    return !isReady ?
            <CenteredLoader />
        :   <QueryComponent
                resourceName={t('resource.userDetails')}
                query={userDetailsQuery}
                eventInfo={{ event: InvalidateEvent.UserGetById, id: userId }}
            >
                {userDetailsQuery.data && (
                    <Stack>
                        <Group
                            position="apart"
                            align="start"
                        >
                            <Stack sx={{ flexGrow: 1 }}>
                                <Group
                                    align="end"
                                    position="apart"
                                >
                                    <Text
                                        weight="bold"
                                        size="xl"
                                    >
                                        {userDetailsQuery.data.name}
                                    </Text>
                                    <QueryComponent
                                        resourceName={t('resource.rating')}
                                        query={userRatingQuery}
                                        eventInfo={{
                                            event: InvalidateEvent.RatingGetAverageRatingForUser,
                                            id: userId,
                                        }}
                                    >
                                        <RatingComponent averageRating={userRatingQuery.data} />
                                    </QueryComponent>
                                </Group>
                                <RichTextDisplay
                                    bordered
                                    richText={userDetailsQuery.data.introduction}
                                    maxHeight={300}
                                />
                            </Stack>
                            <UserImage user={userDetailsQuery.data} />
                        </Group>
                        {Boolean(userDetailsQuery.data.createdEvents.length) && (
                            <>
                                <Text size="lg">{t('userDetails.createdEvents')}</Text>
                                <ScrollArea>
                                    <Box sx={{ maxHeight: 300 }}>
                                        <EventGrid events={userDetailsQuery.data.createdEvents} />
                                    </Box>
                                </ScrollArea>
                            </>
                        )}
                        {Boolean(userDetailsQuery.data.participatedEvents.length) && (
                            <>
                                <Text size="lg">{t('userDetails.participatedEvents')}</Text>
                                <ScrollArea>
                                    <Box sx={{ maxHeight: 300 }}>
                                        <EventGrid
                                            events={userDetailsQuery.data.participatedEvents}
                                        />
                                    </Box>
                                </ScrollArea>
                            </>
                        )}
                    </Stack>
                )}
            </QueryComponent>;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
