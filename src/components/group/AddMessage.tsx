import { ActionIcon, Flex, TextInput, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSend } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { CreateMessageType } from '../../models/Message';
import { api } from '../../utils/api';
import { defaultCreateComment } from '../../utils/defaultObjects';
import { OverlayLoader } from '../OverlayLoader';

export const AddMessage: FunctionComponent<{
    groupId: number;
}> = ({ groupId }) => {
    const theme = useMantineTheme();
    const { t } = useTranslation('common');

    const form = useForm<CreateMessageType>({
        initialValues: defaultCreateComment,
    });

    const createMessage = api.groupChat.create.useMutation({
        onSuccess: form.reset,
    });

    return (
        <OverlayLoader loading={createMessage.isLoading}>
            <form
                onSubmit={form.onSubmit((data) =>
                    createMessage.mutate({ createMessage: data, groupId })
                )}
            >
                <Flex gap="xs">
                    <TextInput
                        sx={{ flexGrow: 1 }}
                        placeholder={t('messageForm.addMessage')}
                        {...form.getInputProps('text')}
                    />
                    <ActionIcon
                        title={t('messageForm.addMessage')}
                        size={36}
                        variant="filled"
                        color={theme.primaryColor}
                        type="submit"
                        disabled={!form.isValid() || !form.isDirty()}
                    >
                        <IconSend />
                    </ActionIcon>
                </Flex>
            </form>
        </OverlayLoader>
    );
};
