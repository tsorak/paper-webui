export type VersionEntry = {
  id: string;
  type: string;
  url: string;
};

async function getVanillaVersions(): Promise<VersionEntry[]> {
  const res = await fetch(
    "https://launchermeta.mojang.com/mc/game/version_manifest.json"
  );
  const data = await res.json();

  const v = data.versions as VersionEntry[];

  const versions = v.map((v) => ({
    id: v.id,
    type: v.type,
    url: v.url
  }));

  return versions;
}

async function getPaperVersions(): Promise<VersionEntry[]> {
  const rootURL = "https://papermc.io/api/v2/projects/paper/";
  const res = await fetch(rootURL);
  const data = await res.json();

  const v = data.versions as string[];
  const sortedVersions = v.reverse().map((v) => ({
    id: v,
    type: "release",
    url: `${rootURL}versions/${v}/`
  }));

  return sortedVersions;
}

async function getVersions(
  type: "vanilla" | "papermc"
): Promise<VersionEntry[]> {
  switch (type) {
    case "vanilla":
      return await getVanillaVersions();
    case "papermc":
      return await getPaperVersions();
  }
}

async function getVanillaJar(metaurl: string) {
  const meta = (await (await fetch(metaurl)).json()) as {
    downloads: {
      server: {
        url: string;
      };
    };
    id: string;
  };

  const jarName = meta.id.endsWith(".jar") ? meta.id : `${meta.id}.jar`;

  return { url: meta.downloads.server.url, name: jarName };
}

async function getPaperJar(metaurl: string) {
  const { builds } = (await (await fetch(metaurl)).json()) as {
    builds: number[];
  };

  const build = builds.at(-1);

  const buildMeta = (await (
    await fetch(`${metaurl}builds/${build}`)
  ).json()) as {
    downloads: {
      application: {
        name: string;
      };
    };
  };

  const jarName = buildMeta.downloads.application.name;

  return {
    url: `${metaurl}builds/${build}/downloads/${jarName}`,
    name: jarName
  };
}

export {
  getVanillaVersions,
  getPaperVersions,
  getVersions,
  getVanillaJar,
  getPaperJar
};
