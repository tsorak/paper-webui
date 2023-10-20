import { notificationService } from "@hope-ui/solid";

export interface WorldAPIBody {
  kind: "load" | "delete" | "clone" | "download";
  props: { name?: string };
}

export async function postToWorldAPI(body: WorldAPIBody) {
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

    errorWorldNotification(reqId, body);
    return;
  }

  successWorldNotification(reqId, body);
  console.log(res.ok, await res.json());
}

function setWorldNotification(reqId: string, body: WorldAPIBody) {
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

function successWorldNotification(reqId: string, body: WorldAPIBody) {
  let title = "";
  switch (body.kind) {
    case "load":
      title = `Loaded ${body.props.name}`;
      break;
    case "delete":
      title = `Deleted ${body.props.name}`;
      break;
    case "clone":
      title = `Cloned ${body.props.name}`;
      break;
    case "download":
      title = `Downloaded ${body.props.name}`;
      break;
  }

  notificationService.update({
    title,
    id: reqId,
    status: "success",
  });
}

function errorWorldNotification(reqId: string, body: WorldAPIBody) {
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
    id: reqId,
    status: "danger",
  });
}
