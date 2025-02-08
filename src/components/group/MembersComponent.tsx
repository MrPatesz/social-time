import { showNotification } from '@mantine/notifications';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { usePusher } from '../../hooks/usePusher';
import { BasicUserType } from '../../models/User';
import { api } from '../../utils/api';
import { InvalidateEvent } from '../../utils/enums';
import { UsersComponent } from '../user/UsersComponent';

export const MembersComponent: FunctionComponent<{
    members: BasicUserType[];
    groupId: number;
    isPrivate: boolean;
    isCreator: boolean;
    isMember: boolean;
}> = ({ members, groupId, isPrivate, isCreator, isMember }) => {
    const { data: session } = useSession();
    const { t } = useTranslation('common');

    const hasJoinRequest = api.joinRequest.hasJoinRequest.useQuery(
        { groupId },
        {
            enabled: isPrivate && !isCreator,
        }
    );
    usePusher(
        {
            event: InvalidateEvent.JoinRequestHasJoinRequest,
            id: session?.user.id,
        },
        () => void hasJoinRequest.refetch()
    );

    const joinGroup = api.group.join.useMutation({
        onSuccess: (_, { join }) =>
            showNotification({
                color: 'green',
                title: t(join ? 'notification.group.join.title' : 'notification.group.leave.title'),
                message: t(
                    join ? 'notification.group.join.message' : 'notification.group.leave.message'
                ),
            }),
    });
    const joinRequest = api.joinRequest.mutate.useMutation({
        onSuccess: (_, { join }) => {
            void hasJoinRequest.refetch();
            showNotification({
                color: 'green',
                title: t(
                    join ?
                        'notification.joinRequest.create.title'
                    :   'notification.joinRequest.delete.title'
                ),
                message: t(
                    join ?
                        'notification.joinRequest.create.message'
                    :   'notification.joinRequest.delete.message'
                ),
            });
        },
    });

    return (
        <UsersComponent
            users={members}
            hideJoin={isCreator}
            overrideJoined={isMember ? undefined : hasJoinRequest.data}
            loading={joinGroup.isLoading || joinRequest.isLoading}
            onJoin={(join) => {
                if (isPrivate && !isMember) {
                    joinRequest.mutate({ groupId, join });
                } else {
                    joinGroup.mutate({ id: groupId, join });
                }
            }}
        />
    );
};
