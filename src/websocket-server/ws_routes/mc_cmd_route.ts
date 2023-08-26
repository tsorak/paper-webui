import { mc } from "@/src/queue.ts";
import { Message } from "@/src/websocket/message.ts";

export default function handleMcCmd(message: Message & { type: "mc_cmd" }) {
  const { data } = message;
  if (!data) return;

  mc.sendCMD(data);
}
