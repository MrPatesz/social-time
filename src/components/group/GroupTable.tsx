import {ActionIcon, Box, Group, MantineNumberSize, Stack, Text, TextInput, useMantineTheme} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {IconSearch} from "@tabler/icons";
import {DataTable, DataTableSortStatus} from "mantine-datatable";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {FunctionComponent, useEffect, useState} from "react";
import {Pencil, Plus, Trash} from "tabler-icons-react";
import {SortDirection} from "../../models/event/PaginateEvents";
import {BasicGroupType} from "../../models/group/Group";
import {SortGroupByProperty} from "../../models/group/PaginateGroups";
import {api} from "../../utils/api";
import {getLongDateFormatter} from "../../utils/formatters";
import {PAGE_SIZES} from "../event/EventTable";
import {QueryComponent} from "../QueryComponent";
import {GroupForm} from "./GroupForm";

export enum GroupTableDisplayPlace {
  CONTROL_PANEL = "CONTROL_PANEL",
  GROUPS_PAGE = "GROUPS_PAGE",
}

const GroupTable: FunctionComponent<{
  groupTableDisplayPlace: GroupTableDisplayPlace;
}> = ({groupTableDisplayPlace}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES.at(0) as number);
  const [sortBy, setSortBy] = useState<DataTableSortStatus>({columnAccessor: "createdAt", direction: "desc"});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const theme = useMantineTheme();
  const {push: pushRoute, locale} = useRouter();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);

  const groupsQuery = api.group.getPaginatedGroups.useQuery({
    page: page,
    pageSize: pageSize,
    sortBy: {
      property: sortBy.columnAccessor as SortGroupByProperty,
      direction: sortBy.direction as SortDirection,
    },
    searchQuery: debouncedSearchQuery,
    createdOnly: groupTableDisplayPlace === GroupTableDisplayPlace.CONTROL_PANEL,
  });
  const deleteGroup = api.group.delete.useMutation({
    onSuccess: () => groupsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.group.delete.title"),
        message: t("notification.group.delete.message"),
      })),
  });

  useEffect(() => {
    if (groupsQuery.data?.groups.length === 0 && page !== 1) {
      setPage(page - 1);
    }
  }, [groupsQuery.data, page]);

  const onDeleteClick = (group: BasicGroupType) => openConfirmModal({
    title: t("modal.group.delete.title"),
    children: (
      <Stack>
        <Text>
          {t("modal.group.delete.message")}
        </Text>
        <Text weight="bold">
          "{group.name}"
        </Text>
      </Stack>
    ),
    labels: {confirm: t("button.confirm"), cancel: t("button.cancel")},
    onConfirm: () => deleteGroup.mutate(group.id),
  });

  return (
    <Stack sx={{height: "100%"}}>
      <Group>
        <TextInput
          sx={{flexGrow: 1}}
          icon={<IconSearch/>}
          placeholder={t("filterEvents.search") as string}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <ActionIcon
          size="lg"
          variant="filled"
          color={theme.fn.themeColor(theme.primaryColor)}
          onClick={() => openModal({
            title: t("modal.group.create"),
            children: <GroupForm/>,
          })}
        >
          <Plus/>
        </ActionIcon>
      </Group>
      <QueryComponent resourceName={t("resource.groups")} query={groupsQuery}>
        <Box sx={{maxHeight: "calc(100vh - (72px + 36px + 16px + 16px))" /*TODO*/}}>
          <DataTable
            highlightOnHover
            withBorder
            withColumnBorders
            textSelectionDisabled
            borderRadius={theme.defaultRadius as MantineNumberSize}
            minHeight={!groupsQuery.data?.groups.length ? 175 : undefined}
            noRecordsText={t("groupTable.noRecords") as string}
            sortStatus={sortBy}
            onSortStatusChange={setSortBy}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            recordsPerPageLabel={t("groupTable.recordsPerPage") as string}
            recordsPerPage={pageSize}
            onRecordsPerPageChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            records={groupsQuery.data?.groups}
            totalRecords={groupsQuery.data?.size}
            onRowClick={(group) => pushRoute(`groups/${group.id}`, undefined, {locale})}
            columns={[
              {
                accessor: "name",
                title: t("common.name"),
                sortable: true,
              },
              {
                accessor: "createdAt",
                title: t("groupTable.createdAt"),
                sortable: true,
                render: ({createdAt}) => longDateFormatter.format(createdAt),
              },
              {
                accessor: "creatorName",
                title: t("myEvents.creator"),
                hidden: groupTableDisplayPlace === GroupTableDisplayPlace.CONTROL_PANEL,
                render: ({creator}) => creator.name,
              },
              {
                accessor: "actions",
                title: t("myEvents.actions"),
                hidden: groupTableDisplayPlace === GroupTableDisplayPlace.GROUPS_PAGE,
                width: 85,
                render: (group) => (
                  <Group spacing="xs" noWrap>
                    <ActionIcon
                      variant="transparent"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          title: t("modal.group.edit"),
                          children: <GroupForm editedGroupId={group.id}/>,
                        });
                      }}
                      sx={theme => ({
                        "&:hover": {
                          color: theme.fn.themeColor(theme.primaryColor),
                        },
                      })}
                    >
                      <Pencil/>
                    </ActionIcon>
                    <ActionIcon
                      variant="transparent"
                      size="md"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onDeleteClick(group);
                      }}
                      sx={theme => ({
                        "&:hover": {
                          color: theme.colors.red[6],
                        },
                      })}
                    >
                      <Trash/>
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

export default GroupTable;