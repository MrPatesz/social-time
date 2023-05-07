import {Card, Group, Stack, Text} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import i18nConfig from "../../../next-i18next.config.mjs";
import {EventGrid} from "../../components/event/EventGrid";
import {QueryComponent} from "../../components/QueryComponent";
import {RichTextDisplay} from "../../components/rich-text/RichTextDisplay";
import UserImage from "../../components/user/UserImage";
import {api} from "../../utils/api";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {RatingComponent} from "../../components/RatingComponent";

export default function UserDetailsPage() {
  const {query: {id}, isReady} = useRouter();
  const {t} = useTranslation("common");

  const userId = id as string;
  const userDetailsQuery = api.user.getById.useQuery(userId, {
    enabled: isReady,
  });
  const userRatingQuery = api.rating.getAverageRatingForUser.useQuery(userId, {
    enabled: isReady,
  });

  return (
    <QueryComponent resourceName={t("resource.userDetails")} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <Stack>
          <Group position="apart" align="start">
            <Stack sx={{flexGrow: 1}}>
              <Group align="end" position="apart">
                <Text weight="bold" size="xl">
                  {userDetailsQuery.data.name}
                </Text>
                <RatingComponent averageRating={userRatingQuery.data}/>
              </Group>
              {userDetailsQuery.data.introduction && (
                <Card withBorder sx={theme => ({backgroundColor: getBackgroundColor(theme)})}>
                  <RichTextDisplay richText={userDetailsQuery.data.introduction} maxHeight={300}/>
                </Card>
              )}
            </Stack>
            <UserImage user={userDetailsQuery.data}/>
          </Group>
          {Boolean(userDetailsQuery.data.createdEvents.length) && (
            <>
              <Text size="lg">
                {t("userDetails.createdEvents")}
              </Text>
              <EventGrid events={userDetailsQuery.data.createdEvents}/>
            </>
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
