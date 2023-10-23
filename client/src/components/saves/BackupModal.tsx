import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Tooltip,
  Spinner,
} from "@hope-ui/solid";
import { Accessor, Setter, Show, Signal, createSignal } from "solid-js";
import CloneForm from "./CloneForm";
import { postToWorldAPI } from "../../communication/postToWorldAPI";

export default function BackupModal({
  modalState,
  promiseControls,
}: {
  modalState: Signal<boolean>;
  promiseControls?: Accessor<{
    controls: {
      resolve: Function;
      reject: Function;
    };
  }>;
}) {
  const [isOpen, setIsOpen] = modalState;
  const [backupPending, setBackupPending] = createSignal(false);
  const [deletePending, setDeletePending] = createSignal(false);

  const loading = () => backupPending() || deletePending();

  const cloneFormProps = {
    targetSave: "world",
    cloneState: [backupPending, setBackupPending] as Signal<boolean>,
    modalState,
    promiseControls,
  };

  const onSkip = async () => {
    if (loading()) return;

    setDeletePending(true);
    await deleteCurrentSave();
    setDeletePending(false);

    promiseControls().controls.resolve("User skipped backup.");

    onClose();
  };

  const onDeny = () => {
    if (loading()) return;

    promiseControls().controls.reject("User denied backup.");

    onClose();
  };

  const onClose = () => {
    if (loading()) return;

    setIsOpen(false);
  };

  return (
    <Modal opened={isOpen()} onClose={onDeny}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Backup Current Save</ModalHeader>
        <ModalBody>
          <p class="text-gray-500">
            Would you like to backup your current save?
          </p>
          <CloneForm {...cloneFormProps}>
            <div class="mb-2 mt-3 relative">
              <Show when={loading()}>
                <div class="flex justify-center items-center absolute bg-[#fff9] dark:bg-[#0009] z-50 h-full w-full">
                  <Spinner size="md" />
                </div>
              </Show>
              <div class="flex justify-between">
                <div class="flex gap-2">
                  <Button colorScheme="success" type="submit">
                    Submit
                  </Button>
                  <Tooltip label="The current save will be deleted">
                    <Button colorScheme="warning" onClick={onSkip}>
                      Skip
                    </Button>
                  </Tooltip>
                </div>
                <Button colorScheme="neutral" onClick={onDeny}>
                  Cancel
                </Button>
              </div>
            </div>
          </CloneForm>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

async function deleteCurrentSave() {
  return await postToWorldAPI({
    kind: "delete",
    props: {
      name: "world",
    },
  });
}
