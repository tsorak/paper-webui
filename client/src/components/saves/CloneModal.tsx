import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@hope-ui/solid";
import { Accessor, Setter, Signal } from "solid-js";
import CloneForm from "./CloneForm";

export default function CloneModal({
  selectedSave,
  setCloneName,
  modalState,
  promiseControls,
}: {
  selectedSave: Accessor<string>;
  setCloneName: Setter<string>;
  modalState: Signal<boolean>;
  promiseControls?: Accessor<{
    controls: {
      resolve: Function;
      reject: Function;
    };
  }>;
}) {
  const [isOpen, setIsOpen] = modalState;

  const cloneFormProps = {
    targetSave: selectedSave,
    modalState,
    promiseControls,
    setCloneName,
  };

  const onDeny = () => {
    promiseControls().controls.reject("User cancelled cloning process.");

    onClose();
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal opened={isOpen()} onClose={onDeny}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Clone Save</ModalHeader>
        <ModalBody>
          <p class="text-gray-500">Enter a name for the new save.</p>
          <CloneForm {...cloneFormProps}>
            <div class="flex justify-between mb-2 mt-3 relative">
              <Button colorScheme="success" type="submit">
                Submit
              </Button>
              <Button colorScheme="neutral" onClick={onDeny}>
                Cancel
              </Button>
            </div>
          </CloneForm>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
