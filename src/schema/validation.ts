import { z } from "zod";
import {
  type CustomRuleConfig,
  type FieldSchema,
  type FormSchema,
  type VisibilityCondition
} from "./types";

export type FormValues = Record<string, string | number | boolean | undefined>;

type CustomRule = {
  label: string;
  appliesTo: FieldSchema["type"][];
  validate: (value: unknown, config: CustomRuleConfig) => true | string;
};

export const customRuleRegistry: Record<CustomRuleConfig["name"], CustomRule> = {
  businessEmail: {
    label: "Business email",
    appliesTo: ["text"],
    validate: (value) => {
      const email = String(value ?? "").toLowerCase();
      if (!email) {
        return true;
      }

      const blockedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
      const domain = email.split("@")[1];

      return domain && !blockedDomains.includes(domain)
        ? true
        : "Use a business email address.";
    }
  },
  startsWith: {
    label: "Starts with",
    appliesTo: ["text", "textarea"],
    validate: (value, config) => {
      const prefix = config.value ?? "";
      if (!prefix || !value) {
        return true;
      }

      return String(value).startsWith(prefix) ? true : `Must start with "${prefix}".`;
    }
  },
  mustBeTrue: {
    label: "Must be checked",
    appliesTo: ["checkbox"],
    validate: (value) => (value === true ? true : "This must be checked.")
  }
};

export function createDefaultValues(schema: FormSchema): FormValues {
  return schema.fields.reduce<FormValues>((values, field) => {
    values[field.name] = getFieldDefaultValue(field);
    return values;
  }, {});
}

export function getFieldDefaultValue(field: FieldSchema): string | number | boolean {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if (field.type === "checkbox") {
    return false;
  }

  return "";
}

export function isFieldVisible(field: FieldSchema, values: FormValues): boolean {
  if (!field.visibility) {
    return true;
  }

  return evaluateVisibility(field.visibility, values);
}

export function getVisibleFields(schema: FormSchema, values: FormValues): FieldSchema[] {
  return schema.fields.filter((field) => isFieldVisible(field, values));
}

export function createZodSchema(schema: FormSchema, values: FormValues): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape = getVisibleFields(schema, values).reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
    acc[field.name] = createFieldValidator(field);
    return acc;
  }, {});

  return z.object(shape);
}

export function getSubmissionPayload(schema: FormSchema, values: FormValues): FormValues {
  return getVisibleFields(schema, values).reduce<FormValues>((payload, field) => {
    payload[field.name] = values[field.name];
    return payload;
  }, {});
}

function evaluateVisibility(condition: VisibilityCondition, values: FormValues): boolean {
  const value = values[condition.fieldName];

  if (condition.operator === "exists") {
    return value !== undefined && value !== "" && value !== false;
  }

  if (condition.operator === "equals") {
    return String(value ?? "") === String(condition.value ?? "");
  }

  return String(value ?? "") !== String(condition.value ?? "");
}

function createFieldValidator(field: FieldSchema): z.ZodTypeAny {
  if (field.type === "checkbox") {
    let validator: z.ZodTypeAny = z.boolean();

    if (field.required) {
      validator = validator.refine((value) => value === true, "This field is required.");
    }

    return applyCustomRules(validator, field);
  }

  if (field.type === "number") {
    const numberSchema = field.required
      ? z.number({ message: "This field is required." })
      : z.number({ message: "Enter a valid number." }).optional();
    let validator: z.ZodTypeAny = z.preprocess((value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }

      return Number(value);
    }, numberSchema);

    if (!field.required) {
      validator = validator.optional();
    }

    if (field.required) {
      validator = validator.refine((value) => value !== undefined, "This field is required.");
    }

    if (typeof field.validation?.min === "number") {
      validator = validator.refine(
        (value) => value === undefined || (typeof value === "number" && value >= field.validation!.min!),
        `Must be at least ${field.validation.min}.`
      );
    }

    if (typeof field.validation?.max === "number") {
      validator = validator.refine(
        (value) => value === undefined || (typeof value === "number" && value <= field.validation!.max!),
        `Must be no more than ${field.validation.max}.`
      );
    }

    return applyCustomRules(validator, field);
  }

  let validator: z.ZodTypeAny = field.required
    ? z.string().trim().min(1, "This field is required.")
    : z.string().optional().or(z.literal(""));

  if (typeof field.validation?.min === "number") {
    validator = validator.refine(
      (value) => !value || String(value).length >= field.validation!.min!,
      `Must be at least ${field.validation.min} characters.`
    );
  }

  if (typeof field.validation?.max === "number") {
    validator = validator.refine(
      (value) => !value || String(value).length <= field.validation!.max!,
      `Must be no more than ${field.validation.max} characters.`
    );
  }

  if (field.validation?.regex) {
    const regex = new RegExp(field.validation.regex);
    validator = validator.refine((value) => !value || regex.test(String(value)), "Invalid format.");
  }

  if ((field.type === "select" || field.type === "radio") && field.options?.length) {
    const allowedValues = new Set(field.options.map((option) => option.value));
    validator = validator.refine(
      (value) => !value || allowedValues.has(String(value)),
      "Choose one of the available options."
    );
  }

  return applyCustomRules(validator, field);
}

function applyCustomRules<T extends z.ZodTypeAny>(validator: T, field: FieldSchema): z.ZodTypeAny {
  const rules = field.validation?.customRules ?? [];

  return rules.reduce<z.ZodTypeAny>((current, rule) => {
    const registryRule = customRuleRegistry[rule.name];

    if (!registryRule || !registryRule.appliesTo.includes(field.type)) {
      return current;
    }

    return current.superRefine((value, context) => {
      const result = registryRule.validate(value, rule);
      if (result !== true) {
        context.addIssue({
          code: "custom",
          message: result
        });
      }
    });
  }, validator);
}
