import { Hono } from "@/deps.ts";

import staticRoute from "./handlers/staticRoute.ts";
import versionRoute from "./handlers/versionRoute.ts";
import logRoute from "./handlers/logRoute.ts";
import worldRoute from "./handlers/worldRoute.ts";

const app = new Hono();

app.route("/", staticRoute);
app.route("/", versionRoute);
app.route("/", logRoute);
app.route("/", worldRoute);

export default app.fetch;
