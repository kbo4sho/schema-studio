import { defaultSchema } from "./defaultSchema";
import { normalizeSchema, parseSchemaJson } from "./utils";
import type { FormSchema, JsonImportResult } from "./types";

export const STORAGE_KEY = "schema-studio.formSchema";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveSchema(schema: FormSchema, storage: StorageLike = window.localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(schema));
}

export function loadSchema(storage: StorageLike = window.localStorage): JsonImportResult {
  const saved = storage.getItem(STORAGE_KEY);

  if (!saved) {
    return { ok: true, schema: normalizeSchema(defaultSchema) };
  }

  return parseSchemaJson(saved);
}

export function resetSavedSchema(storage: StorageLike = window.localStorage): FormSchema {
  storage.removeItem(STORAGE_KEY);
  return normalizeSchema(defaultSchema);
}
