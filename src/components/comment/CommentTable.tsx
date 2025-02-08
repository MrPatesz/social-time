import { ActionIcon, Box, Group, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { openConfirmModal, openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconPencil, IconSearch, IconTrash } from '@tabler/icons-react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FunctionComponent, useEffect, useState } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { DetailedCommentType } from '../../models/Comment';
import { api } from '../../utils/api';
import { SortCommentByProperty, SortDirection } from '../../utils/enums';
import { useLongDateFormatter } from '../../utils/formatters';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../event/EventTable';
import { QueryComponent } from '../QueryComponent';
import { RichTextDisplay } from '../rich-text/RichTextDisplay';
import { CommentForm } from './CommentForm';

const CommentTable: FunctionComponent = () => {
    const [page, setPage] = useState<number>(1);
    // TODO useLocalStorage, same for all tables
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [sortBy, setSortBy] = useState<DataTableSortStatus>({
        columnAccessor: 'postedAt',
        direction: 'desc',
    });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

    const theme = useMantineTheme();
    const { locale } = useMyRouter();
    const { t } = useTranslation('common');
    const longDateFormatter = useLongDateFormatter();

    const commentsQuery = api.comment.getAllCreated.useQuery({
        page,
        pageSize,
        searchQuery: debouncedSearchQuery,
        sortBy: {
            property: sortBy.columnAccessor as SortCommentByProperty,
            direction: sortBy.direction as SortDirection,
        },
    });
    const deleteComment = api.comment.delete.useMutation({
        onSuccess: () => {
            void commentsQuery.refetch();
            showNotification({
                color: 'green',
                title: t('notification.comment.delete.title'),
                message: t('notification.comment.delete.message'),
            });
        },
    });

    useEffect(() => {
        if (commentsQuery.data?.comments.length === 0 && page !== 1) {
            setPage(page - 1);
        }
    }, [commentsQuery.data, page]);

    const onDeleteClick = (comment: DetailedCommentType) =>
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
            labels: { confirm: t('button.confirm'), cancel: t('button.cancel') },
            onConfirm: () => deleteComment.mutate(comment.id),
        });

    return (
        <Stack h="100%">
            <TextInput
                icon={<IconSearch />}
                placeholder={t('filterEvents.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
            <QueryComponent
                resourceName={t('resource.comments')}
                query={commentsQuery}
                loading={deleteComment.isLoading}
            >
                <Box
                    sx={{
                        height: '100%',
                        minHeight: 300,
                        position: 'relative',
                    }}
                >
                    <DataTable
                        sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                        }}
                        highlightOnHover
                        withBorder
                        withColumnBorders
                        textSelectionDisabled
                        borderRadius={theme.defaultRadius}
                        noRecordsText={t('commentTable.noRecords')}
                        sortStatus={sortBy}
                        onSortStatusChange={setSortBy}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        recordsPerPageLabel={t('commentTable.recordsPerPage')}
                        recordsPerPage={pageSize}
                        onRecordsPerPageChange={(newPageSize) => {
                            setPageSize(newPageSize);
                            setPage(1);
                        }}
                        records={commentsQuery.data?.comments}
                        totalRecords={commentsQuery.data?.size}
                        columns={[
                            {
                                accessor: 'text',
                                title: t('commentTable.message'),
                                sortable: true,
                                width: 300,
                                render: ({ text }) => (
                                    <RichTextDisplay
                                        scroll
                                        richText={text}
                                        maxHeight={50}
                                    />
                                ),
                            },
                            {
                                accessor: 'postedAt',
                                title: t('commentTable.postedAt'),
                                sortable: true,
                                render: ({ postedAt }) => longDateFormatter.format(postedAt),
                            },
                            {
                                accessor: 'event',
                                title: t('commentTable.event'),
                                sortable: true,
                                render: ({ event }) => (
                                    <Link
                                        href={`/events/${event.id}`}
                                        locale={locale}
                                        passHref
                                    >
                                        {event.name}
                                    </Link>
                                ),
                            },
                            {
                                accessor: 'actions',
                                title: t('myEvents.actions'),
                                width: 85,
                                render: (comment) => (
                                    <Group
                                        spacing="xs"
                                        noWrap
                                    >
                                        <ActionIcon
                                            title={t('modal.comment.edit')}
                                            variant="transparent"
                                            size="md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal({
                                                    title: t('modal.comment.edit'),
                                                    children: (
                                                        <CommentForm
                                                            eventId={comment.eventId}
                                                            editedComment={comment}
                                                        />
                                                    ),
                                                });
                                            }}
                                            sx={(theme) => ({
                                                '&:hover': {
                                                    color: theme.fn.themeColor(theme.primaryColor),
                                                },
                                            })}
                                        >
                                            <IconPencil />
                                        </ActionIcon>
                                        <ActionIcon
                                            title={t('modal.comment.delete.title')}
                                            variant="transparent"
                                            size="md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteClick(comment);
                                            }}
                                            sx={(theme) => ({
                                                '&:hover': {
                                                    color: theme.colors.red[6],
                                                },
                                            })}
                                        >
                                            <IconTrash />
                                        </ActionIcon>
                                    </Group>
                                ),
                            },
                        ]}
                    />
                </Box>
            </QueryComponent>
        </Stack>
    );
};

export default CommentTable;
