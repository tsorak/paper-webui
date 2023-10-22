import { Context, validator } from "hono/mod.ts";
import { z } from "zod/mod.ts";
import badRequest from "@/src/utils/badRequest.ts";
import { createDateFilename } from "@/src/utils/savename.ts";

interface Prop {
  name: string;
}

interface RenameProp extends Prop {
  newName: string;
}

interface LoadProp extends Prop {
  autoRestart: boolean;
}

interface CloneProp extends Prop {
  to: string;
}

const validate = {
  POST: validator("json", (value, c) => {
    const OUTER_OBJ_SCHEMA = z.object({
      kind: z.string(),
      props: z.object({}),
    });

    const { success } = OUTER_OBJ_SCHEMA.safeParse(value);
    if (!success) return badRequest(c);

    const { kind, props } = value as {
      kind: "load" | "delete" | "rename" | "clone" | "download";
      props: Record<string, unknown>;
    };

    const validTypes = ["load", "delete", "rename", "clone", "download"];
    if (!validTypes.includes(kind)) {
      return badRequest(c);
    }

    if (kind === "rename") {
      return validateRename({ kind, props }, c);
    } else if (kind === "load") {
      return validateLoad({ kind, props }, c);
    } else if (kind === "clone") {
      return validateClone({ kind, props }, c);
    }
    return validateProp({ kind, props }, c);
  }),
};

function validateProp(
  value: { kind: "delete" | "download"; props: unknown },
  c: Context
) {
  const PROP_SCHEMA = z.object({
    name: z.string(),
  });

  const { success } = PROP_SCHEMA.safeParse(value.props);
  if (!success) return badRequest(c);

  return {
    kind: value.kind,
    props: value.props as Prop,
  };
}

function validateClone(value: { kind: "clone"; props: unknown }, c: Context) {
  const CLONE_SCHEMA = z.object({
    name: z.string(),
    to: z
      .string()
      .default("")
      .transform((v) => {
        if (v) return v;
        return createDateFilename();
      }),
  });

  const { success } = CLONE_SCHEMA.safeParse(value.props);
  if (!success) return badRequest(c);

  return {
    kind: value.kind,
    props: value.props as CloneProp,
  };
}

function validateRename(value: { kind: "rename"; props: unknown }, c: Context) {
  const RENAME_SCHEMA = z.object({
    name: z.string(),
    newName: z.string(),
  });

  const { success } = RENAME_SCHEMA.safeParse(value.props);
  if (!success) return badRequest(c);

  return {
    kind: value.kind,
    props: value.props as RenameProp,
  };
}

function validateLoad(value: { kind: "load"; props: unknown }, c: Context) {
  const LOAD_SCHEMA = z.object({
    name: z.string(),
    autoRestart: z.boolean(),
  });

  const { success } = LOAD_SCHEMA.safeParse(value.props);
  if (!success) return badRequest(c);

  return {
    kind: value.kind,
    props: value.props as LoadProp,
  };
}

export type { Prop, RenameProp, LoadProp, CloneProp };
export { validate };
