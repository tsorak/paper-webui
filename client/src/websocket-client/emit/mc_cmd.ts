import { Message } from "../../../../websocket/message";
import { CS } from "../socket";

const command = (s: CS, cmd: string) => {
  const mc_cmd_msg: Message & { type: "mc_cmd" } = {
    type: "mc_cmd",
    data: cmd
  };
  s.json(mc_cmd_msg);
};

export { command };
