import { Hono } from "@/deps.ts";

import staticRoute from "./handlers/staticRoute.ts";
import versionRoute from "./handlers/versionRoute.ts";
import logRoute from "./handlers/logRoute.ts";

const app = new Hono();

app.route("/", staticRoute);
app.route("/", versionRoute);
app.route("/", logRoute);

export default app.fetch;
