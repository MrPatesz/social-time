import {
    ActionIcon,
    Box,
    Checkbox,
    Flex,
    Group,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { openConfirmModal, openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconPencil, IconSearch, IconTrash } from '@tabler/icons-react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useEffect, useState } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { BasicEventType } from '../../models/Event';
import { api } from '../../utils/api';
import {
    EventTableDisplayPlace,
    InvalidateEvent,
    SortDirection,
    SortEventByProperty,
} from '../../utils/enums';
import { useLongDateFormatter, usePriceFormatter } from '../../utils/formatters';
import { QueryComponent } from '../QueryComponent';
import { EditEventForm } from './EditEventForm';

const DATE_TIME = 'dateTime';
export const PAGE_SIZES: number[] = [10, 25, 50];
export const DEFAULT_PAGE_SIZE: number = PAGE_SIZES.at(0) as number;

const EventTable: FunctionComponent<{
    eventTableDisplayPlace: EventTableDisplayPlace;
}> = ({ eventTableDisplayPlace }) => {
    const [archive, setArchive] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [sortBy, setSortBy] = useState<DataTableSortStatus>({
        columnAccessor: DATE_TIME,
        direction: 'desc',
    });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const { locale, pushRoute } = useMyRouter();
    const { t } = useTranslation('common');
    const longDateFormatter = useLongDateFormatter();
    const priceFormatter = usePriceFormatter();

    const eventsQuery = api.event.getPaginatedEvents.useQuery({
        archive: archive,
        page: page,
        pageSize: pageSize,
        sortBy: {
            property: (sortBy.columnAccessor === DATE_TIME ?
                'start'
            :   sortBy.columnAccessor) as SortEventByProperty,
            direction: sortBy.direction as SortDirection,
        },
        searchQuery: debouncedSearchQuery,
        createdOnly: eventTableDisplayPlace === EventTableDisplayPlace.CONTROL_PANEL,
    });
    const deleteEvent = api.event.delete.useMutation({
        onSuccess: () =>
            showNotification({
                color: 'green',
                title: t('notification.event.delete.title'),
                message: t('notification.event.delete.message'),
            }),
    });

    useEffect(() => {
        if (eventsQuery.data?.events.length === 0 && page !== 1) {
            setPage(page - 1);
        }
    }, [eventsQuery.data, page]);

    const onDeleteClick = (event: BasicEventType) =>
        openConfirmModal({
            title: t('modal.event.delete.title'),
            children: (
                <Stack>
                    <Text>{t('modal.event.delete.message')}</Text>
                    <Text weight="bold">&quot;{event.name}&quot;</Text>
                </Stack>
            ),
            labels: { confirm: t('button.confirm'), cancel: t('button.cancel') },
            onConfirm: () => deleteEvent.mutate(event.id),
        });

    return (
        <Stack h="100%">
            <Flex
                gap="xs"
                align="center"
            >
                <TextInput
                    sx={{ flexGrow: 1 }}
                    icon={<IconSearch />}
                    placeholder={t('filterEvents.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
                <Checkbox
                    label={t('myEvents.archive')}
                    checked={archive}
                    onChange={(e) => setArchive(e.currentTarget.checked)}
                />
            </Flex>
            <QueryComponent
                resourceName={t('resource.events')}
                query={eventsQuery}
                eventInfo={{ event: InvalidateEvent.EventGetPaginatedEvents }}
                loading={deleteEvent.isLoading}
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
                        noRecordsText={t('myEvents.noRecords')}
                        sortStatus={sortBy}
                        onSortStatusChange={setSortBy}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        recordsPerPageLabel={t('myEvents.recordsPerPage')}
                        recordsPerPage={pageSize}
                        onRecordsPerPageChange={(newPageSize) => {
                            setPageSize(newPageSize);
                            setPage(1);
                        }}
                        records={eventsQuery.data?.events}
                        totalRecords={eventsQuery.data?.size}
                        onRowClick={(event) =>
                            void pushRoute(`/events/${event.id}`, undefined, { locale })
                        }
                        columns={[
                            {
                                accessor: 'name',
                                title: t('common.name'),
                                sortable: true,
                            },
                            {
                                accessor: DATE_TIME,
                                title: t('myEvents.dateTime'),
                                sortable: true,
                                render: ({ start, end }) =>
                                    longDateFormatter.formatRange(start, end),
                            },
                            {
                                accessor: 'location',
                                title: t('common.location'),
                                render: ({ location }) => location.address,
                            },
                            {
                                accessor: 'price',
                                title: t('common.price'),
                                sortable: true,
                                render: ({ price }) => price && priceFormatter.format(price),
                            },
                            {
                                accessor: 'limit',
                                title: t('myEvents.limit'),
                                sortable: true,
                            },
                            {
                                accessor: 'groupName',
                                title: t('myEvents.group'),
                                render: ({ group }) => group?.name,
                            },
                            {
                                accessor: 'creatorName',
                                title: t('myEvents.creator'),
                                hidden:
                                    eventTableDisplayPlace === EventTableDisplayPlace.CONTROL_PANEL,
                                render: ({ creator }) => creator.name,
                            },
                            {
                                accessor: 'actions',
                                title: t('myEvents.actions'),
                                hidden:
                                    eventTableDisplayPlace === EventTableDisplayPlace.EVENTS_PAGE ||
                                    archive,
                                width: 85,
                                render: (event) => (
                                    <Group
                                        spacing="xs"
                                        noWrap
                                    >
                                        <ActionIcon
                                            title={t('modal.event.edit')}
                                            variant="transparent"
                                            size="md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal({
                                                    title: t('modal.event.edit'),
                                                    children: <EditEventForm eventId={event.id} />,
                                                    fullScreen: !xs,
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
                                            title={t('modal.event.delete.title')}
                                            variant="transparent"
                                            size="md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteClick(event);
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

export default EventTable;
