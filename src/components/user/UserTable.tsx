import { Box, ColorSwatch, Stack, TextInput, useMantineTheme } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { InvalidateEvent, SortDirection } from '../../utils/enums';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../event/EventTable';
import { QueryComponent } from '../QueryComponent';
import { RichTextDisplay } from '../rich-text/RichTextDisplay';
import UserImage from './UserImage';
import { useMyRouter } from '../../hooks/useMyRouter';

const UserTable: FunctionComponent = () => {
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [sortBy, setSortBy] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

    const theme = useMantineTheme();
    const { locale, pushRoute } = useMyRouter();
    const { t } = useTranslation('common');

    const usersQuery = api.user.getPaginatedUsers.useQuery({
        page,
        pageSize,
        sortBy: { direction: sortBy.direction as SortDirection },
        searchQuery: debouncedSearchQuery,
    });

    useEffect(() => {
        if (usersQuery.data?.users.length === 0 && page !== 1) {
            setPage(page - 1);
        }
    }, [usersQuery.data, page]);

    return (
        <Stack h="100%">
            <TextInput
                sx={{ flexGrow: 1 }}
                icon={<IconSearch />}
                placeholder={t('filterEvents.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
            <QueryComponent
                resourceName={t('resource.users')}
                query={usersQuery}
                eventInfo={{ event: InvalidateEvent.UserGetPaginatedUsers }}
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
                        noRecordsText={t('userTable.noRecords')}
                        sortStatus={sortBy}
                        onSortStatusChange={setSortBy}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        recordsPerPageLabel={t('userTable.recordsPerPage')}
                        recordsPerPage={pageSize}
                        onRecordsPerPageChange={(newPageSize) => {
                            setPageSize(newPageSize);
                            setPage(1);
                        }}
                        records={usersQuery.data?.users}
                        totalRecords={usersQuery.data?.size}
                        onRowClick={(user) =>
                            void pushRoute(`/users/${user.id}`, undefined, { locale })
                        }
                        columns={[
                            {
                                accessor: 'name',
                                title: t('common.name'),
                                sortable: true,
                            },
                            {
                                accessor: 'introduction',
                                title: t('profileForm.introduction'),
                                render: ({ introduction }) => (
                                    <RichTextDisplay
                                        scroll
                                        richText={introduction}
                                        maxHeight={50}
                                    />
                                ),
                            },
                            {
                                accessor: 'image',
                                title: t('userTable.image'),
                                render: (user) => (
                                    <UserImage
                                        user={user}
                                        size={25}
                                    />
                                ),
                            },
                            {
                                accessor: 'themeColor',
                                title: t('themeColorPicker.label'),
                                render: ({ themeColor }) => (
                                    <ColorSwatch color={theme.fn.themeColor(themeColor)} />
                                ),
                            },
                        ]}
                    />
                </Box>
            </QueryComponent>
        </Stack>
    );
};

export default UserTable;
