import { showNotification } from '@mantine/notifications';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { DetailedEventType } from '../../models/Event';
import { api } from '../../utils/api';
import { EventStatus } from '../../utils/enums';
import { UsersComponent } from '../user/UsersComponent';

export const ParticipantsComponent: FunctionComponent<{
    event: DetailedEventType;
}> = ({ event }) => {
    const { data: session } = useSession();
    const { t } = useTranslation('common');

    const participate = api.event.participate.useMutation({
        onSuccess: () =>
            showNotification({
                color: 'green',
                title: t('notification.event.participation.title'),
                message: t('notification.event.participation.message'),
            }),
    });

    return (
        <UsersComponent
            users={event.participants}
            hideJoin={event.creatorId === session?.user.id || event.status === EventStatus.ARCHIVE}
            onJoin={(join) =>
                participate.mutate({
                    id: event.id,
                    participate: join,
                })
            }
            eventLimit={event.limit}
        />
    );
};
