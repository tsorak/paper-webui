import { mc } from "../../queue.ts";
import { Message } from "../../websocket/message.ts";

export default function handleMcCmd(message: Message & { type: "mc_cmd" }) {
  const { data } = message;
  if (!data) return;

  mc.sendCMD(data);
}
