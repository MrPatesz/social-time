import { ActionIcon, Flex, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { MutateCommentType } from '../../models/Comment';
import { api } from '../../utils/api';
import { defaultCreateComment } from '../../utils/defaultObjects';
import { OverlayLoader } from '../OverlayLoader';
import { RichTextField } from '../rich-text/RichTextField';

export const AddComment: FunctionComponent<{
    eventId: number;
}> = ({ eventId }) => {
    const theme = useMantineTheme();
    const { t } = useTranslation('common');

    const form = useForm<MutateCommentType>({
        initialValues: defaultCreateComment,
    });

    const createComment = api.comment.create.useMutation({
        onSuccess: () => {
            form.reset();
            showNotification({
                color: 'green',
                title: t('notification.comment.create.title'),
                message: t('notification.comment.create.message'),
            });
        },
    });

    return (
        <OverlayLoader loading={createComment.isLoading}>
            <form
                onSubmit={form.onSubmit((data) =>
                    createComment.mutate({ createComment: data, eventId })
                )}
            >
                <Flex gap="xs">
                    <RichTextField
                        maxLength={512}
                        placeholder={t('commentForm.addComment')}
                        formInputProps={form.getInputProps('text')}
                    />
                    <ActionIcon
                        title={t('commentForm.addComment')}
                        type="submit"
                        disabled={!form.isValid() || !form.isDirty()}
                        size={36}
                        color={theme.primaryColor}
                        variant="filled"
                    >
                        <IconSend />
                    </ActionIcon>
                </Flex>
            </form>
        </OverlayLoader>
    );
};
