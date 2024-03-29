import { notificationService } from "@hope-ui/solid";
import type { WorldBody } from "../../../src/webui/validators/world_validator.ts";

export async function postToWorldAPI(body: WorldBody) {
  const reqId = crypto.randomUUID();
  setWorldNotification(reqId, body);

  const res = await fetch("/world", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(res.ok, res);

    if (res.headers.get("Content-Type") !== "application/json") {
      errorWorldNotification(reqId, body);
      return;
    }

    const resBody = await res.json();
    errorWorldNotification(reqId, body, resBody);
    return;
  }

  let resBody;
  if (res.headers.get("Content-Type") === "application/json") {
    resBody = await res.json();
  }
  successWorldNotification(reqId, body, resBody);
  console.log("postToWorldAPI success!", resBody);
}

function setWorldNotification(reqId: string, body: WorldBody) {
  let title = "";
  switch (body.kind) {
    case "load":
      title = `Loading ${body.props.name}`;
      break;
    case "delete":
      title = `Deleting ${body.props.name}`;
      break;
    case "clone":
      title = `Cloning ${body.props.name}`;
      break;
    case "download":
      title = `Preparing ${body.props.name} for download`;
      break;
  }

  notificationService.show({
    title,
    id: reqId,
    loading: true,
    persistent: true,
    closable: false,
  });
}

function successWorldNotification(
  reqId: string,
  body: WorldBody,
  resBody?: Record<string, unknown>
) {
  let title,
    description = "";
  switch (body.kind) {
    case "load":
      title = `Loaded ${body.props.name}`;
      break;
    case "delete":
      title = `Deleted ${body.props.name}`;
      break;
    case "clone":
      title = `Cloned ${body.props.name}`;
      description = `'${body.props.name}' has been cloned to '${resBody?.savedAs}'`;
      break;
    case "download":
      title = `Downloaded ${body.props.name}`;
      break;
  }

  notificationService.update({
    title,
    description,
    id: reqId,
    status: "success",
    persistent: false,
    duration: 3000,
  });
}

function errorWorldNotification(
  reqId: string,
  body: WorldBody,
  resBody?: { success: boolean; reason: string }
) {
  let title = "";
  switch (body.kind) {
    case "load":
      title = `Failed to load ${body.props.name}`;
      break;
    case "delete":
      title = `Failed to delete ${body.props.name}`;
      break;
    case "clone":
      title = `Failed to clone ${body.props.name}`;
      break;
    case "download":
      title = `Failed to download ${body.props.name}`;
      break;
  }

  notificationService.update({
    title,
    description: resBody?.reason ?? "",
    id: reqId,
    status: "danger",
    persistent: false,
    duration: 3000,
  });
}
