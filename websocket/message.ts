export interface Message {
  type: "ping" | string;
  data: unknown;
}

function parse(message: string): Message | null {
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { type, data } = parsed;

    if (typeof type !== "string") return null;

    return { type, data };
  } catch (_e) {
    return null;
  }
}

export { parse };
