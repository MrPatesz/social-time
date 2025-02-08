import { ActionIcon, Card, Group, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { openConfirmModal, openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { BasicCommentType } from '../../models/Comment';
import { BasicMessageType } from '../../models/Message';
import { api } from '../../utils/api';
import dayjs from '../../utils/dayjs';
import { useLongDateFormatter } from '../../utils/formatters';
import { OverlayLoader } from '../OverlayLoader';
import { RichTextDisplay } from '../rich-text/RichTextDisplay';
import UserImage from '../user/UserImage';
import { CommentForm } from './CommentForm';

export const CommentCard: FunctionComponent<{
    comment: BasicCommentType | BasicMessageType;
}> = ({ comment }) => {
    const longDateFormatter = useLongDateFormatter();
    const theme = useMantineTheme();
    const { locale } = useMyRouter();
    const { data: session } = useSession();
    const { t } = useTranslation('common');

    const deleteComment = api.comment.delete.useMutation({
        onSuccess: () =>
            showNotification({
                color: 'green',
                title: t('notification.comment.delete.title'),
                message: t('notification.comment.delete.message'),
            }),
    });

    return (
        <OverlayLoader loading={deleteComment.isLoading}>
            <Card
                withBorder
                key={comment.id}
            >
                <Stack spacing="xs">
                    <Group
                        position="apart"
                        align="start"
                    >
                        <Group>
                            <UserImage
                                user={comment.user}
                                size={53.6}
                            />
                            <Stack spacing={4}>
                                <Link
                                    href={`/users/${comment.user.id}`}
                                    locale={locale}
                                    passHref
                                >
                                    <Text weight="bold">{comment.user.name}</Text>
                                </Link>
                                <Tooltip
                                    label={longDateFormatter.format(comment.postedAt)}
                                    color={theme.primaryColor}
                                    position="right"
                                >
                                    <Text
                                        color="dimmed"
                                        sx={{ width: 'fit-content' }}
                                    >
                                        {dayjs(comment.postedAt).fromNow()}
                                    </Text>
                                </Tooltip>
                            </Stack>
                        </Group>
                        {'eventId' in comment && comment.userId === session?.user.id && (
                            <Group
                                position="right"
                                spacing="xs"
                            >
                                <ActionIcon
                                    title={t('modal.comment.edit')}
                                    size="sm"
                                    variant="transparent"
                                    onClick={() =>
                                        openModal({
                                            title: t('modal.comment.edit'),
                                            children: (
                                                <CommentForm
                                                    eventId={comment.eventId}
                                                    editedComment={comment}
                                                />
                                            ),
                                            size: 'xl',
                                        })
                                    }
                                >
                                    <IconPencil />
                                </ActionIcon>
                                <ActionIcon
                                    title={t('modal.comment.delete.title')}
                                    size="sm"
                                    variant="transparent"
                                    onClick={() =>
                                        openConfirmModal({
                                            title: t('modal.comment.delete.title'),
                                            children: (
                                                <Stack>
                                                    <Text>{t('modal.comment.delete.message')}</Text>
                                                    <RichTextDisplay
                                                        bordered
                                                        richText={comment.text}
                                                        maxHeight={100}
                                                    />
                                                </Stack>
                                            ),
                                            labels: {
                                                confirm: t('button.confirm'),
                                                cancel: t('button.cancel'),
                                            },
                                            onConfirm: () => deleteComment.mutate(comment.id),
                                        })
                                    }
                                >
                                    <IconTrash />
                                </ActionIcon>
                            </Group>
                        )}
                    </Group>
                    <RichTextDisplay
                        richText={comment.text}
                        maxHeight={100}
                    />
                </Stack>
            </Card>
        </OverlayLoader>
    );
};
