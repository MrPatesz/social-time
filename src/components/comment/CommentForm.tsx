import { Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { BasicCommentType, MutateCommentType } from '../../models/Comment';
import { api } from '../../utils/api';
import { defaultCreateComment } from '../../utils/defaultObjects';
import RichTextEditor from '../rich-text/RichTextEditor';
import { getFormStringOnChange, getFormStringValue } from '../../utils/mantineFormUtils';
import { OverlayLoader } from '../OverlayLoader';

// TODO only used for editing now
export const CommentForm: FunctionComponent<{
    editedComment?: BasicCommentType | MutateCommentType;
    eventId: number;
}> = ({ editedComment, eventId }) => {
    const queryContext = api.useContext();
    const { t } = useTranslation('common');

    const form = useForm<MutateCommentType>({
        initialValues: editedComment ?? defaultCreateComment,
    });

    const createComment = api.comment.create.useMutation({
        onSuccess: () => {
            closeAllModals();
            showNotification({
                color: 'green',
                title: t('notification.comment.create.title'),
                message: t('notification.comment.create.message'),
            });
        },
    });
    const updateComment = api.comment.update.useMutation({
        onSuccess: () => {
            void queryContext.comment.getAllCreated.refetch();
            closeAllModals();
            showNotification({
                color: 'green',
                title: t('notification.comment.update.title'),
                message: t('notification.comment.update.message'),
            });
        },
    });

    return (
        <OverlayLoader loading={createComment.isLoading || updateComment.isLoading}>
            <form
                onSubmit={form.onSubmit((data) =>
                    editedComment && 'id' in editedComment ?
                        updateComment.mutate({
                            commentId: editedComment.id,
                            comment: data,
                            eventId,
                        })
                    :   createComment.mutate({ createComment: data, eventId })
                )}
            >
                <Stack>
                    <RichTextEditor
                        placeholder={t('commentForm.addComment')}
                        value={getFormStringValue(form, 'text')}
                        onChange={getFormStringOnChange(form, 'text')}
                    />
                    <Group position="right">
                        <Button
                            onClick={form.reset}
                            color="gray"
                            disabled={!form.isDirty()}
                        >
                            {t('button.reset')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!form.isValid() || !form.isDirty()}
                        >
                            {t('button.submit')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </OverlayLoader>
    );
};
