import { Hono } from "hono/mod.ts";

import staticRoute from "@/src/webui/handlers/staticRoute.ts";
import versionRoute from "@/src/webui/handlers/versionRoute.ts";
import logRoute from "@/src/webui/handlers/logRoute.ts";
import worldRoute from "@/src/webui/handlers/worldRoute.ts";

const app = new Hono();

app.route("/", staticRoute);
app.route("/", versionRoute);
app.route("/", logRoute);
app.route("/", worldRoute);

export default app.fetch;
