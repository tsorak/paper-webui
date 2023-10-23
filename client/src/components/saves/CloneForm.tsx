import { FormControl, FormHelperText, FormLabel, Input } from "@hope-ui/solid";
import { Accessor, Setter, Signal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { postToWorldAPI } from "../../communication/postToWorldAPI";

export default function CloneForm({
  children,
  modalState,
  cloneState,
  promiseControls,
  setCloneName,
}: {
  children: JSX.Element;
  modalState: Signal<boolean>;
  cloneState?: Signal<boolean>;
  promiseControls?: Accessor<{
    controls: {
      resolve: Function;
      reject: Function;
    };
  }>;
  setCloneName?: Setter<string>;
}) {
  const [_, setIsOpen] = modalState;
  const [clonePending, setClonePending] = cloneState ?? [
    () => false,
    (_) => {},
  ];
  const submitBehavior =
    setCloneName !== undefined ? "return_savename" : "backup_world";

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const body = Object.fromEntries(formData.entries()) as {
      savename: string;
    };

    if (submitBehavior === "return_savename") {
      setCloneName(body.savename);
      onClose();

      promiseControls().controls.resolve();

      return;
    } else if (submitBehavior === "backup_world") {
      if (body.savename === "") delete body.savename;

      setClonePending(true);
      await postToWorldAPI({
        kind: "clone",
        props: {
          name: "world",
          to: body.savename,
        },
      });
      setClonePending(false);
      onClose();

      promiseControls().controls.resolve();
    }
  }

  const onClose = () => {
    if (clonePending()) return;

    setIsOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} class="select-none" autocomplete="off">
      <FormControl>
        <FormLabel>Save Name</FormLabel>
        <Input name="savename" type="text" />
        <FormHelperText>
          Leaving this empty means the current timestamp will be used.
        </FormHelperText>
      </FormControl>
      {children}
    </form>
  );
}
