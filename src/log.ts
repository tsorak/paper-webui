import { resolve } from "path/mod.ts";

export const out = (...messages: unknown[]) => {
  const formated = messages.join(" ").replaceAll("\n", " ");

  const HMS = new Date().toTimeString().split(" ")[0];
  console.log(
    `[${HMS} INFO] {%cDENO%c}: ${formated}`,
    "color: #007bff",
    "color: unset"
  );
};

export const save = async (...messages: unknown[]) => {
  const formated = messages.join(" ").replaceAll("\n", " ") + "\n";

  const HMS = new Date().toTimeString().split(" ")[0];
  const msg = `[${HMS} INFO] {DENO}: ${formated}`;

  await Deno.writeTextFile(resolve(Deno.cwd(), "latest.log"), msg, {
    append: true,
  });
};

export const saveRaw = async (...messages: string[]) => {
  const formated = messages.join(" ");
  await Deno.writeTextFile(resolve(Deno.cwd(), "latest.log"), formated, {
    append: true,
  });
};

export const both = async (...messages: unknown[]) => {
  const m = messages.join(" ");
  out(m);
  await save(m);
};
