export const out = (...messages: unknown[]) => {
  const formated = messages.join(" ").replaceAll("\n", " ");

  const HMS = new Date().toTimeString().split(" ")[0];
  console.log(
    `[${HMS} INFO] {%cDENO%c}: ${formated}`,
    "color: #007bff",
    "color: unset"
  );
};

export const save = (...messages: unknown[]) => {
  const formated = messages.join(" ").replaceAll("\n", " ") + "\n";

  const HMS = new Date().toTimeString().split(" ")[0];
  const msg = `[${HMS} INFO] {DENO}: ${formated}`;

  Deno.writeTextFileSync("latest.log", msg, { append: true });
};

export const saveRaw = (...messages: string[]) => {
  const formated = messages.join(" ");
  Deno.writeTextFileSync("latest.log", formated, { append: true });
};

export const both = (...messages: unknown[]) => {
  const m = messages.join(" ");
  out(m);
  save(m);
};
