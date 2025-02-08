import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { closeAllModals } from '@mantine/modals';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import UserImage from '../user/UserImage';
import { api } from '../../utils/api';
import { InvalidateEvent } from '../../utils/enums';
import { QueryComponent } from '../QueryComponent';
import { useMyRouter } from '../../hooks/useMyRouter';
import { IconMoodCheck, IconMoodX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { showNotification } from '@mantine/notifications';

export const JoinRequestsDialog: FunctionComponent<{
    groupId: number;
}> = ({ groupId }) => {
    const { locale } = useMyRouter();
    const { t } = useTranslation('common');

    const joinRequests = api.joinRequest.getAllByGroupId.useQuery({ groupId: groupId });

    const accept = api.joinRequest.accept.useMutation({
        onSuccess: (_, { accept }) => {
            void joinRequests.refetch();
            showNotification({
                color: 'green',
                title:
                    accept ?
                        t('notification.joinRequest.accept.title')
                    :   t('notification.joinRequest.decline.title'),
                message:
                    accept ?
                        t('notification.joinRequest.accept.message')
                    :   t('notification.joinRequest.decline.message'),
            });
        },
    });

    return (
        <QueryComponent
            query={joinRequests}
            resourceName={t('joinRequestsDialog.resourceName')}
            loading={accept.isLoading}
            eventInfo={{ event: InvalidateEvent.JoinRequestGetAllByGroupId, id: groupId }}
        >
            {joinRequests.data && (
                <Stack spacing="xs">
                    {joinRequests.data.map((joinRequest) => (
                        <Link
                            key={joinRequest.userId}
                            href={`/users/${joinRequest.userId}`}
                            locale={locale}
                            passHref
                        >
                            <Card
                                withBorder
                                padding={6}
                                onClick={() => closeAllModals()}
                            >
                                <Group position="apart">
                                    <Group>
                                        <UserImage
                                            user={joinRequest.user}
                                            size={40}
                                        />
                                        <Text>{joinRequest.user.name}</Text>
                                    </Group>
                                    <Group spacing="xs">
                                        <ActionIcon
                                            title={t('joinRequestsDialog.accept')}
                                            variant="subtle"
                                            color="green"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                accept.mutate({
                                                    groupId,
                                                    userId: joinRequest.userId,
                                                    accept: true,
                                                });
                                            }}
                                        >
                                            <IconMoodCheck />
                                        </ActionIcon>
                                        <ActionIcon
                                            title={t('joinRequestsDialog.decline')}
                                            variant="subtle"
                                            color="red"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                accept.mutate({
                                                    groupId,
                                                    userId: joinRequest.userId,
                                                    accept: false,
                                                });
                                            }}
                                        >
                                            <IconMoodX />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        </Link>
                    ))}
                </Stack>
            )}
        </QueryComponent>
    );
};
