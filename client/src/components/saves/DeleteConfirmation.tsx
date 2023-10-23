import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@hope-ui/solid";
import { Accessor, Signal } from "solid-js";

export default function DeleteConfirmationModal({
  modalState,
  toBeDeleted,
  promiseControls,
}: {
  modalState: Signal<boolean>;
  toBeDeleted: Accessor<string>;
  promiseControls?: Accessor<{
    controls: {
      resolve: Function;
      reject: Function;
    };
  }>;
}) {
  const [isOpen, setIsOpen] = modalState;

  const onAccept = () => {
    promiseControls().controls.resolve("User accepted deletion");

    onClose();
  };

  const onDeny = () => {
    promiseControls().controls.reject("User rejected deletion");

    onClose();
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal opened={isOpen()} onClose={onDeny}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete confirmation</ModalHeader>
        <ModalBody>
          <p class="text-gray-500 mb-6">
            Are you sure you want to delete '{toBeDeleted()}'
          </p>
          <div class="flex justify-between items-center mb-3">
            <Button colorScheme="warning" onClick={onAccept}>
              Yes
            </Button>
            <Button colorScheme="success" onClick={onDeny}>
              No
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
