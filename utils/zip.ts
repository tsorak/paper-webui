async function compress(
  files: string | string[],
  archiveName: string,
  options: { overwrite?: boolean; flags?: string[]; workdir?: string }
) {
  return (
    await new Deno.Command("zip", {
      args: [
        "-r",
        ...(options?.flags ?? []),
        archiveName,
        ...(Array.isArray(files) ? files : [files]),
      ],
      cwd: options?.workdir ?? "./",
    })
      .spawn()
      .output()
  ).success;
}

async function decompress(archive: string, extractPath = "./") {
  return (
    await new Deno.Command("unzip", {
      args: ["-o", archive, "-d", extractPath],
    })
      .spawn()
      .output()
  ).success;
}

export { compress, decompress };
