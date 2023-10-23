import { Accessor, Setter, Show, createSignal } from "solid-js";
import {
  Alert,
  AlertIcon,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tooltip,
} from "@hope-ui/solid";

import { useMcContext } from "../context/mcContext";
import socket, { emit } from "../websocket-client/socket";
import * as ensure_stopped from "../websocket-client/utils/ensureStopped";

const shutdownInstance = async () => {
  emit.runner.stop(socket.instance);
  await ensure_stopped.rawPromise;
};

export default function ShutdownOptionModal({
  isOpen,
  setIsOpen,
  promiseControls,
}: {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
  promiseControls?: Accessor<{
    controls: {
      resolve: Function;
      reject: Function;
    };
  }>;
}) {
  const [stopping, setStopping] = createSignal(false);

  const [mcCtx, _] = useMcContext();
  const onlinePlayers = () => mcCtx.mcInstance.players;

  const onAccept = async () => {
    if (stopping()) return;

    setStopping(true);
    await shutdownInstance();
    setStopping(false);
    onClose();

    promiseControls().controls.resolve();
  };

  const onDeny = () => {
    if (stopping()) return;

    promiseControls().controls.reject("User denied shutdown.");

    onClose();
  };

  const onClose = () => {
    if (stopping()) return;

    setIsOpen(false);
  };

  return (
    <Modal opened={isOpen()} onClose={onDeny}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Shutdown required</ModalHeader>
        <ModalBody>
          <p class="mb-2">The operation requires the instance to be stopped.</p>
          <Show
            when={onlinePlayers().length === 0}
            fallback={OnlinePlayersWarning({ onlinePlayers })}
          >
            <Alert status="success">
              <AlertIcon mr="$2_5" />
              There are no players online.
            </Alert>
          </Show>
          <p class="mt-2 mb-3">Do you want to stop the instance?</p>
          <div class="flex justify-between mb-3">
            <div class="flex gap-2">
              <Button colorScheme={"warning"} onClick={onAccept} class="w-16">
                <Show when={!stopping()} fallback={<Spinner size="sm" />}>
                  Yes
                </Show>
              </Button>
              <Button colorScheme={"success"} onClick={onDeny}>
                No
              </Button>
            </div>
            <Button colorScheme={"neutral"} onClick={onDeny}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function OnlinePlayersWarning({
  onlinePlayers,
}: {
  onlinePlayers: () => string[];
}) {
  const allPlayersMessage = () => {
    const players = onlinePlayers();
    if (players.length === 1) {
      return `${players[0]} is online.`;
    } else {
      return `The following players are online: ${players.join(", ")}`;
    }
  };

  return (
    <Tooltip label={allPlayersMessage()}>
      <Alert status="warning">
        <AlertIcon mr="$2_5" />
        There are {onlinePlayers().length} player(s) online.
      </Alert>
    </Tooltip>
  );
}
