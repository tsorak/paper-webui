async function fileExists(path: string): Promise<boolean> {
  let exists = false;
  try {
    exists = (await Deno.stat(path)).isFile;
  } catch (_e) {
    //
  }
  return exists;
}

export { fileExists };
