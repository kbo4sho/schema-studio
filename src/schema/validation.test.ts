import { describe, expect, it } from "vitest";
import { defaultSchema } from "./defaultSchema";
import { createDefaultValues, createZodSchema, getSubmissionPayload, getVisibleFields } from "./validation";

describe("dynamic validation", () => {
  it("creates default values from schema fields", () => {
    const values = createDefaultValues(defaultSchema);

    expect(values.country).toBe("US");
    expect(values.policyAcknowledgement).toBe(false);
  });

  it("validates required, regex, custom, and number constraints", () => {
    const values = {
      employeeName: "J",
      workEmail: "person@gmail.com",
      country: "US",
      state: "",
      benefitType: "health",
      coverageAmount: 20,
      startDate: "",
      notes: "",
      policyAcknowledgement: false
    };
    const result = createZodSchema(defaultSchema, values).safeParse(values);

    expect(result.success).toBe(false);
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      expect(flattened.employeeName?.[0]).toContain("at least");
      expect(flattened.workEmail?.join(" ")).toContain("business email");
      expect(flattened.coverageAmount?.[0]).toContain("at least");
      expect(flattened.policyAcknowledgement?.join(" ")).toContain("checked");
    }
  });

  it("excludes hidden conditional fields from validation and submission", () => {
    const values = {
      employeeName: "Jane Chen",
      workEmail: "jane@company.com",
      country: "CA",
      state: "",
      benefitType: "health",
      coverageAmount: 1000,
      startDate: "2026-06-01",
      notes: "",
      policyAcknowledgement: true
    };
    const visibleFields = getVisibleFields(defaultSchema, values);
    const result = createZodSchema(defaultSchema, values).safeParse(values);
    const payload = getSubmissionPayload(defaultSchema, values);

    expect(visibleFields.some((field) => field.name === "state")).toBe(false);
    expect(result.success).toBe(true);
    expect(payload).not.toHaveProperty("state");
  });
});
