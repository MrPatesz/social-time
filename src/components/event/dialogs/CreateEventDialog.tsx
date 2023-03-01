import {Modal} from "@mantine/core";
import {FunctionComponent} from "react";
import {api} from "../../../utils/api";
import {getDefaultCreateEvent} from "../../../utils/defaultObjects";
import {EventForm} from "../EventForm";

export const CreateEventDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  initialInterval?: {
    start: Date;
    end: Date;
  };
}> = ({open, onClose, initialInterval}) => {
  const queryContext = api.useContext();
  const useCreate = api.event.create.useMutation({
    onSuccess: () => queryContext.event.invalidate(),
  });

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Create Event"
      closeOnClickOutside={false}
    >
      <EventForm
        originalEvent={initialInterval ? getDefaultCreateEvent(initialInterval) : undefined}
        onSubmit={(data) => useCreate.mutateAsync(data).then(onClose)}
      />
    </Modal>
  );
};