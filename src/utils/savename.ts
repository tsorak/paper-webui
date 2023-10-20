function createDateFilename() {
  return new Date()
    .toJSON()
    .split(".")[0]
    .replaceAll(":", "-")
    .replace("T", "_")
    .replaceAll(" ", "_");
  // 2023-10-20_22-25-02
}

function ensureZipExtension(filename: string) {
  if (!filename.endsWith(".zip")) filename += ".zip";
  return filename;
}

export { createDateFilename, ensureZipExtension };
