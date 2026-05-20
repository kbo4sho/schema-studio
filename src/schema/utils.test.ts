import { describe, expect, it } from "vitest";
import { defaultSchema } from "./defaultSchema";
import { parseSchemaJson, slugifyName, validateFormSchema } from "./utils";

describe("schema utilities", () => {
  it("slugifies labels into stable field names", () => {
    expect(slugifyName("Work Email")).toBe("workEmail");
    expect(slugifyName("123 Monthly budget")).toBe("monthlyBudget");
  });

  it("rejects duplicate field names on import", () => {
    const duplicate = {
      ...defaultSchema,
      fields: [
        { ...defaultSchema.fields[0], name: "email" },
        { ...defaultSchema.fields[1], name: "email" }
      ]
    };

    expect(validateFormSchema(duplicate)).toContain("must be unique");
  });

  it("parses and normalizes valid schema JSON", () => {
    const result = parseSchemaJson(JSON.stringify(defaultSchema));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.schema.fields[0].name).toBe("employeeName");
      expect(result.schema.fields.find((field) => field.name === "country")?.defaultValue).toBe("US");
    }
  });

  it("returns useful errors for invalid JSON", () => {
    const result = parseSchemaJson("{broken");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Invalid JSON/);
    }
  });
});
