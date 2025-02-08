import { ActionIcon, Box, Group, SimpleGrid, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { IconLock, IconLockOpen, IconPencil } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo } from 'react';
import i18nConfig from '../../../next-i18next.config.mjs';
import { CenteredLoader } from '../../components/CenteredLoader';
import { CollapsibleCard } from '../../components/CollapsibleCard';
import { EditGroupForm } from '../../components/group/EditGroupForm';
import { GroupChat } from '../../components/group/GroupChat';
import { GroupFeed } from '../../components/group/GroupFeed';
import { JoinRequestsDialog } from '../../components/group/JoinRequestsDialog';
import { MembersComponent } from '../../components/group/MembersComponent';
import { QueryComponent } from '../../components/QueryComponent';
import { RatingComponent } from '../../components/RatingComponent';
import { RichTextDisplay } from '../../components/rich-text/RichTextDisplay';
import { UserBadge } from '../../components/user/UserBadge';
import { usePathId } from '../../hooks/usePathId';
import { api } from '../../utils/api';
import { InvalidateEvent } from '../../utils/enums';
import { useLongDateFormatter } from '../../utils/formatters';

export default function GroupDetailsPage() {
    const longDateFormatter = useLongDateFormatter();
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const { id: groupId, isReady } = usePathId<number>();
    const { data: session } = useSession();
    const { t } = useTranslation('common');

    const queryContext = api.useContext();
    const groupQuery = api.group.getById.useQuery(groupId!, {
        enabled: isReady,
    });
    const groupRatingQuery = api.rating.getAverageRatingForGroup.useQuery(groupId!, {
        enabled: isReady,
    });

    useEffect(() => {
        if (isReady) {
            void queryContext.groupChat.getMessages.prefetchInfinite({ groupId });
            void queryContext.event.getFeed.prefetchInfinite({ groupId });
            void queryContext.rating.getAverageRatingForGroup.prefetch(groupId);
            void queryContext.joinRequest.hasJoinRequest.prefetch({ groupId });
        }
    }, [isReady, groupId, queryContext]);

    const isPrivate = Boolean(groupQuery.data?.isPrivate);
    const isCreator = groupQuery.data?.creatorId === session?.user.id;
    const isMember = useMemo(
        () => Boolean(groupQuery.data?.members.find((m) => m.id === session?.user.id)),
        [groupQuery.data?.members, session?.user.id]
    );

    const lockSize = 28;

    return !isReady ?
            <CenteredLoader />
        :   <QueryComponent
                resourceName={t('resource.groupDetails')}
                query={groupQuery}
                eventInfo={{ event: InvalidateEvent.GroupGetById, id: groupId }}
                // loading={joinGroup.isLoading}
            >
                {groupQuery.data && (
                    <Stack h="100%">
                        <Group
                            position="apart"
                            align="start"
                        >
                            <Stack>
                                <Group>
                                    {isPrivate ?
                                        <Box
                                            title={t('groupDetails.private')}
                                            sx={{ height: lockSize }}
                                        >
                                            {isCreator ?
                                                <ActionIcon
                                                    title={t('joinRequestsDialog.review')}
                                                    size={lockSize}
                                                    variant="filled"
                                                    color={theme.primaryColor}
                                                    onClick={() =>
                                                        openModal({
                                                            title: t(
                                                                'joinRequestsDialog.resourceName'
                                                            ),
                                                            children: (
                                                                <JoinRequestsDialog
                                                                    groupId={groupId}
                                                                />
                                                            ),
                                                        })
                                                    }
                                                >
                                                    <IconLock size={lockSize} />
                                                </ActionIcon>
                                            :   <IconLock size={lockSize} />}
                                        </Box>
                                    :   <Box
                                            title={t('groupDetails.public')}
                                            sx={{ height: lockSize }}
                                        >
                                            <IconLockOpen size={lockSize} />
                                        </Box>
                                    }
                                    <Text
                                        weight="bold"
                                        size="xl"
                                    >
                                        {groupQuery.data.name}
                                    </Text>
                                    <UserBadge
                                        useLink
                                        user={groupQuery.data.creator}
                                    />
                                </Group>
                                <Text>
                                    {t('groupTable.createdAt')}:{' '}
                                    {longDateFormatter.format(groupQuery.data.createdAt)}
                                </Text>
                                <QueryComponent
                                    resourceName={t('resource.rating')}
                                    query={groupRatingQuery}
                                    eventInfo={{
                                        event: InvalidateEvent.RatingGetAverageRatingForGroup,
                                        id: groupId,
                                    }}
                                >
                                    <RatingComponent averageRating={groupRatingQuery.data} />
                                </QueryComponent>
                            </Stack>
                            <Stack align="end">
                                <MembersComponent
                                    members={groupQuery.data.members}
                                    isPrivate={isPrivate}
                                    isCreator={isCreator}
                                    isMember={isMember}
                                    groupId={groupId}
                                />
                                {isCreator && (
                                    <ActionIcon
                                        title={t('modal.group.edit')}
                                        size="lg"
                                        variant="filled"
                                        color={theme.fn.themeColor(theme.primaryColor)}
                                        onClick={() =>
                                            openModal({
                                                title: t('modal.group.edit'),
                                                children: <EditGroupForm groupId={groupId} />,
                                                size: 'lg',
                                                fullScreen: !xs,
                                            })
                                        }
                                    >
                                        <IconPencil />
                                    </ActionIcon>
                                )}
                            </Stack>
                        </Group>
                        {isMember ?
                            <>
                                {groupQuery.data.description && (
                                    <CollapsibleCard label={t('groupForm.description.label')}>
                                        <RichTextDisplay richText={groupQuery.data.description} />
                                    </CollapsibleCard>
                                )}
                                <SimpleGrid cols={md ? 2 : 1}>
                                    <GroupFeed groupId={groupId} />
                                    <GroupChat groupId={groupId} />
                                </SimpleGrid>
                            </>
                        :   <RichTextDisplay
                                bordered
                                richText={groupQuery.data.description}
                            />
                        }
                    </Stack>
                )}
            </QueryComponent>;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
