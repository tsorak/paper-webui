export default function log(msg: string, savePath?: string, append = true) {
  const content = `[${new Date().toJSON()}] ${msg}`;

  console.log(content);

  if (savePath) {
    Deno.writeTextFileSync(savePath, content + "\n", { append });
  }
}

export function logToDisk(msg: string, path: string, append = true) {
  if (!path) return;
  const content = `[${new Date().toJSON()}] ~> ${msg}`;

  Deno.writeTextFileSync(path, content + "\n", { append });
}

export function setupLogDirectory() {
  const LOG_DIR = Deno.env.get("LOG_DIR") ?? "logs";

  const cwdEntries = Array.from(Deno.readDirSync("./"));
  const logDirExists = cwdEntries.find(
    (entry) => entry.name === LOG_DIR
  )?.isDirectory;

  if (logDirExists) return;

  Deno.mkdirSync(LOG_DIR);
}
