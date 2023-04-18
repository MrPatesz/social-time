import {ActionIcon, Avatar, Box, Card, Group, SimpleGrid, Stack, Text, useMantineTheme} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {useRouter} from "next/router";
import {Minus, Pencil, Plus} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {GroupChat} from "../../components/group/GroupChat";
import {QueryComponent} from "../../components/QueryComponent";
import {RichTextDisplay} from "../../components/rich-text/RichTextDisplay";
import {api} from "../../utils/api";
import {getLongDateFormatter} from "../../utils/formatters";
import {getBackgroundColor, getInitials} from "../../utils/utilFunctions";
import {useMediaQuery} from "@mantine/hooks";
import {useMemo} from "react";
import {GroupFeed} from "../../components/group/GroupFeed";
import {openModal} from "@mantine/modals";
import {GroupForm} from "../../components/group/GroupForm";

export default function GroupDetailsPage() {
  const theme = useMantineTheme();
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {query: {id}, isReady, locale} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);

  const groupId = parseInt(id as string);
  const groupQuery = api.group.getById.useQuery(groupId, {
    enabled: isReady,
  });
  const useJoinGroup = api.group.join.useMutation({
    onSuccess: (_data, {join}) => groupQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t(join ? "notification.group.join.title" : "notification.group.leave.title"),
        message: t(join ? "notification.group.join.message" : "notification.group.leave.message"),
      })
    ),
  });

  const isMember = useMemo(() => {
    return Boolean(groupQuery.data?.members.find(m => m.id === session?.user.id));
  }, [groupQuery.data?.members, session?.user.id])

  return (
    <QueryComponent resourceName={t("resource.groupDetails")} query={groupQuery}>
      {groupQuery.data && (
        <Stack sx={{height: "100%"}}>
          <Group position="apart" align="start">
            <Stack>
              <Group align="end">
                <Text weight="bold" size="xl">
                  {groupQuery.data.name}
                </Text>
                <Link
                    href={`/users/${groupQuery.data.creator.id}`}
                    locale={locale}
                    passHref
                >
                  <Text color="dimmed">
                    {groupQuery.data.creator.name}
                  </Text>
                </Link>
              </Group>
              <Group>
                <Text>
                  {longDateFormatter.format(groupQuery.data.createdAt)}
                </Text>
                {groupQuery.data?.creatorId === session?.user.id && (
                    <ActionIcon
                        size="lg"
                        variant="filled"
                        color={theme.fn.themeColor(theme.primaryColor)}
                        onClick={() => openModal({
                          title: t("modal.group.create"),
                          children: <GroupForm editedGroupId={groupId}/>,
                        })}
                    >
                      <Pencil/>
                    </ActionIcon>
                )}
              </Group>
            </Stack>
            <Avatar.Group>
              {groupQuery.data.members.slice(0, 5).map(user => (
                  <Avatar
                      key={user.id}
                      variant="filled"
                      radius="xl"
                      size="lg"
                      src={user.image}
                      color={theme.fn.themeColor(theme.primaryColor)}
                >
                  <Text weight="normal" size={10}>
                    {getInitials(user.name)}
                  </Text>
                </Avatar>
              ))}
              {groupQuery.data.members.length > 5 && (
                <Avatar
                  variant="light"
                  radius="xl"
                  size="lg"
                  color={theme.fn.themeColor(theme.primaryColor)}
                >
                  +{groupQuery.data.members.length - 5}
                </Avatar>
              )}
              {groupQuery.data.creatorId !== session?.user.id &&
                (!groupQuery.data.members.find(m => m.id === session?.user.id) ? (
                  <Avatar
                    variant="filled"
                    radius="xl"
                    color={theme.fn.themeColor(theme.primaryColor)}
                  >
                    <ActionIcon
                      variant="filled"
                      color={theme.fn.themeColor(theme.primaryColor)}
                      onClick={() => useJoinGroup.mutate({id: groupId, join: true})}
                    >
                      <Plus/>
                    </ActionIcon>
                  </Avatar>
                ) : (
                  <Avatar
                    variant="filled"
                    radius="xl"
                    color={theme.fn.themeColor(theme.primaryColor)}
                  >
                    <ActionIcon
                      variant="filled"
                      color={theme.fn.themeColor(theme.primaryColor)}
                      onClick={() => useJoinGroup.mutate({id: groupId, join: false})}
                    >
                      <Minus/>
                    </ActionIcon>
                  </Avatar>
                ))}
            </Avatar.Group>
          </Group>
          {isMember ? (
            <SimpleGrid
              cols={md ? 2 : 1}
              sx={{flexGrow: 1}}
            >
              <GroupFeed groupId={groupId}/>
              <Stack>
                {groupQuery.data.description && (
                    <Card withBorder sx={theme => ({backgroundColor: getBackgroundColor(theme)})}>
                      <RichTextDisplay richText={groupQuery.data.description} maxHeight={300} scroll/>
                    </Card>
                )}
                <Box sx={{flexGrow: 1}}>
                  <GroupChat groupId={groupId}/>
                </Box>
              </Stack>
            </SimpleGrid>
          ) : groupQuery.data.description && (
              <Card withBorder sx={theme => ({backgroundColor: getBackgroundColor(theme)})}>
                <RichTextDisplay richText={groupQuery.data.description}/>
              </Card>
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
