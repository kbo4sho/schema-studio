import { describe, expect, it } from "vitest";
import { defaultSchema } from "./defaultSchema";
import { loadSchema, resetSavedSchema, saveSchema, STORAGE_KEY } from "./storage";

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    }
  };
}

describe("schema storage", () => {
  it("saves and loads schema from localStorage-compatible storage", () => {
    const storage = createMemoryStorage();
    saveSchema(defaultSchema, storage);

    const result = loadSchema(storage);

    expect(storage.getItem(STORAGE_KEY)).toContain("Employee Benefits Enrollment");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.schema.title).toBe(defaultSchema.title);
    }
  });

  it("resets storage back to seeded schema", () => {
    const storage = createMemoryStorage();
    saveSchema({ ...defaultSchema, title: "Changed" }, storage);

    const reset = resetSavedSchema(storage);

    expect(reset.title).toBe(defaultSchema.title);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});
