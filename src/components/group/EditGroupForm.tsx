import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {api} from "../../utils/api";
import {QueryComponent} from "../QueryComponent";
import {GroupForm} from "./GroupForm";

export const EditGroupForm: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const {t} = useTranslation("common");

  const queryContext = api.useContext();
  const editedGroupQuery = api.group.getById.useQuery(groupId, {
    refetchOnMount: (query) => !query.isActive(),
  });

  const useUpdate = api.group.update.useMutation({
    onSuccess: () => queryContext.group.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: t("notification.group.update.title"),
        message: t("notification.group.update.message"),
      });
    }),
  });

  return (
    <QueryComponent
      query={editedGroupQuery}
      resourceName={t("resource.groupDetails")}
    >
      {editedGroupQuery.data && (
        <GroupForm
          originalGroup={editedGroupQuery.data}
          onSubmit={(data) => useUpdate.mutate({
            id: groupId,
            group: data,
          })}
        />
      )}
    </QueryComponent>
  );
};