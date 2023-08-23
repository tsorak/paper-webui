import { resolve } from "path/mod.ts";

async function compress(
  files: string | string[],
  archiveName: string,
  options?: { flags?: string[]; workdir?: string }
) {
  return await new Deno.Command("zip", {
    args: [
      "-r",
      resolve(Deno.cwd(), archiveName),
      ...(Array.isArray(files) ? files : [files]),
      ...(options?.flags ?? []),
    ],
    cwd: resolve(Deno.cwd(), options?.workdir ?? "./"),
    stdout: "piped",
    stderr: "piped",
  })
    .spawn()
    .output();
}

async function decompress(archive: string, extractPath = "./") {
  return await new Deno.Command("unzip", {
    args: [
      "-o",
      resolve(Deno.cwd(), archive),
      "-d",
      resolve(Deno.cwd(), extractPath),
    ],
    stdout: "piped",
    stderr: "piped",
  })
    .spawn()
    .output();
}

export { compress, decompress };
