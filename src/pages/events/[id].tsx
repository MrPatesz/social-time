import {ActionIcon, Affix, Badge, Button, Card, Group, Stack, Text,} from "@mantine/core";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {Pencil} from "tabler-icons-react";
import {EditEventDialog} from "../../components/event/EditEventDialog";
import MapComponent from "../../components/MapComponent";
import {QueryComponent} from "../../components/QueryComponent";
import {api} from "../../utils/api";
import {getIntervalString, priceFormatter} from "../../utils/utilFunctions";

export default function EventDetailsPage() {
  const [openEdit, setOpenEdit] = useState(false);

  const {data: session} = useSession();
  const {query: {id}} = useRouter();

  const eventQuery = api.event.getById.useQuery(parseInt(`${id}`));
  const participate: any = undefined; // TODO

  const participateButton = () => {
    if (eventQuery.data?.creatorId === session?.user.id) {
      return;
    }

    return eventQuery.data?.participants.find(
      (p) => p.id === session?.user.id
    ) ? (
      <Button
        onClick={() =>
          participate.mutate({
            id: id?.toString(),
            status: false,
          })
        }
      >
        Remove participation
      </Button>
    ) : (
      <Button
        onClick={() =>
          participate.mutate({
            id: id?.toString(),
            status: true,
          })
        }
      >
        Participate
      </Button>
    );
  };

  const limitBadge = () => {
    if (eventQuery.data?.limit) {
      return (
        <Badge color={"red"}>
          {eventQuery.data.participants.length}/{eventQuery.data.limit}
        </Badge>
      );
    }
  };

  return (
    <>
      <QueryComponent resourceName={"Event Details"} query={eventQuery}>
        {eventQuery.data && (
          <Stack>
            <Group align={"start"} position={"apart"}>
              <Stack>
                <Group align={"end"}>
                  <Text weight="bold" size="xl">
                    {eventQuery.data.name}
                  </Text>
                  <Link
                    href={"/users/[id]"}
                    as={`/users/${eventQuery.data.creator.id}`}
                    passHref
                  >
                    <Text size="lg" sx={{cursor: "pointer"}}>
                      by {eventQuery.data.creator.name}
                    </Text>
                  </Link>
                </Group>
                <Group spacing="xs">
                  <Text>
                    {eventQuery.data.start.toLocaleDateString()}
                  </Text>
                  <Text>
                    {getIntervalString(
                      eventQuery.data.start,
                      eventQuery.data.end
                    )}
                  </Text>
                </Group>
                {eventQuery.data.description && (
                  <Text inherit>{eventQuery.data.description}</Text>
                )}
                {eventQuery.data.equipment && (
                  <Text weight={"bold"}>
                    {eventQuery.data.equipment} shall be brought to the event!
                  </Text>
                )}
                {eventQuery.data.price && (
                  <Text>Price: {priceFormatter.format(eventQuery.data.price)}</Text>
                )}
              </Stack>
              <MapComponent locationDto={eventQuery.data.location}/>
            </Group>
            <Card withBorder shadow="md" p="lg">
              {eventQuery.data.participants.length ? (
                <Stack>
                  <Group position="apart">
                    <Group spacing={"xs"}>
                      {limitBadge()}
                      <Text>They will also be there:</Text>
                    </Group>
                    {participateButton()}
                  </Group>
                  <Group spacing="xs">
                    {eventQuery.data.participants.map((p, index: number) => (
                      <Link
                        href={"/users/[id]"}
                        as={`/users/${p.id}`}
                        passHref
                        key={p.id}
                      >
                        <Text sx={{cursor: "pointer"}}>
                          {p.name}
                          {index !==
                            eventQuery.data.participants.length - 1 && <>,</>}
                        </Text>
                      </Link>
                    ))}
                  </Group>
                </Stack>
              ) : (
                <Group position="apart">
                  <Group spacing={"xs"}>
                    {limitBadge()}
                    <Text>There are no participants yet.</Text>
                  </Group>
                  {participateButton()}
                </Group>
              )}
            </Card>
          </Stack>
        )}
      </QueryComponent>
      {eventQuery.data?.creatorId === session?.user.id && (
        <>
          <EditEventDialog
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            eventId={parseInt(`${id?.toString()}`)}
          />
          <Affix position={{bottom: 20, right: 20}}>
            <ActionIcon
              variant="filled"
              size="xl"
              onClick={() => setOpenEdit(true)}
            >
              <Pencil/>
            </ActionIcon>
          </Affix>
        </>
      )}
    </>
  );
}
