import { Message } from "../../websocket/message";
import { useMcContext } from "../../context/mcContext";
import { CS } from "../socket";

export default function handleInstanceStdout(
  message: Message & { type: "instance_stdout" },
  _ws: CS
) {
  const stdout_line = message.data;
  const [_, setMcContext] = useMcContext();

  setMcContext("mcInstance", "stdout_lines", (prev) => [...prev, stdout_line]);
}
