import { closeAllModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'next-i18next';
import { api } from '../../utils/api';
import { defaultCreateGroup } from '../../utils/defaultObjects';
import { GroupForm } from './GroupForm';

export const CreateGroupForm = () => {
    const { t } = useTranslation('common');

    const createGroup = api.group.create.useMutation({
        onSuccess: () => {
            closeAllModals();
            showNotification({
                color: 'green',
                title: t('notification.group.create.title'),
                message: t('notification.group.create.message'),
            });
        },
    });

    return (
        <GroupForm
            originalGroup={defaultCreateGroup}
            onSubmit={(data) => createGroup.mutate(data)}
            loading={createGroup.isLoading}
        />
    );
};
