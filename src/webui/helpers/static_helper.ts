import * as std_path from "path/mod.ts";
import { exists } from "fs/mod.ts";
import { buildClient } from "@/build.ts";
import { debugCommandOutput } from "@/src/utils/process.ts";
import type { HonoRequest } from "hono/mod.ts";

function getContentType(filename: string): string {
  const extension = std_path.extname(filename);

  switch (extension) {
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".html":
      return "text/html";
    default:
      return "text/plain";
  }
}

async function assetExists(filename: string): Promise<boolean> {
  const pathToAsset = std_path.resolve(
    Deno.cwd(),
    `./client/dist/assets/`,
    filename
  );
  return await exists(pathToAsset);
}

async function getAssetData(filename: string): Promise<Uint8Array> {
  const pathToAsset = std_path.resolve(
    Deno.cwd(),
    `./client/dist/assets/`,
    filename
  );
  return await Deno.readFile(pathToAsset);
}

async function buildApp() {
  const build = await buildClient();
  if (!build.success) {
    console.log("Failed to build client.");
    debugCommandOutput(build);
    return build;
  }

  return build;
}

async function getIndex() {
  const html = await Deno.readTextFile(
    std_path.resolve(Deno.cwd(), "./client/dist/index.html")
  );
  return html;
}

function isJsonContentType(headers: Headers): boolean {
  const contentType = headers.get("content-type");
  if (!contentType) return false;

  return contentType.includes("application/json");
}

async function getCommandFromBody(
  req: HonoRequest
): Promise<string | undefined> {
  const body = await req.json();
  if (typeof body !== "object") return undefined;
  if ("command" in body === false) return undefined;
  if (typeof body.command !== "string") return undefined;

  return body.command;
}

export {
  getAssetData,
  getContentType,
  assetExists,
  buildApp,
  getIndex,
  isJsonContentType,
  getCommandFromBody,
};
