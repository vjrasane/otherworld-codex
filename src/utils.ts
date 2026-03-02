import { createHash } from "crypto";

export function hashContent(content: any) {
  return createHash("sha256").update(JSON.stringify(content)).digest("hex");
}
