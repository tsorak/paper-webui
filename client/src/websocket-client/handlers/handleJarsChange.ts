import { Message } from "../../websocket/message";
import { useMcContext } from "../../context/mcContext";
import { CS } from "../socket";

export default function handleJarsChange(
  message: Message & { type: "jars_change" },
  _ws: CS
) {
  const jars = message.data;
  const [_, setMcContext] = useMcContext();

  if ("initialState" in jars) {
    setMcContext("jars", "installed", new Set(jars.initialState));
  } else if ("jarName" in jars) {
    if (jars.action === "add") {
      setMcContext("jars", "installed", (prev) => {
        const updated = new Set([...prev, jars.jarName].sort());
        return updated;
      });
    } else if (jars.action === "delete") {
      setMcContext("jars", "installed", (prev) => {
        const updated = structuredClone(prev);
        updated.delete(jars.jarName);
        return updated;
      });
    }
  }
}
