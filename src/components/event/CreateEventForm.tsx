import { closeAllModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { api } from '../../utils/api';
import { getDefaultCreateEvent } from '../../utils/defaultObjects';
import { EventForm } from './EventForm';

export const CreateEventForm: FunctionComponent<{
    initialGroupId?: number;
    initialInterval?: {
        start: Date;
        end: Date;
    };
}> = ({ initialGroupId, initialInterval }) => {
    const { t } = useTranslation('common');

    const createEvent = api.event.create.useMutation({
        onSuccess: () => {
            closeAllModals();
            showNotification({
                color: 'green',
                title: t('notification.event.create.title'),
                message: t('notification.event.create.message'),
            });
        },
    });

    return (
        <EventForm
            originalEvent={{
                ...getDefaultCreateEvent(initialInterval),
                groupId: initialGroupId ?? null,
            }}
            onSubmit={createEvent.mutate}
            loading={createEvent.isLoading}
        />
    );
};
