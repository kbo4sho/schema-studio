import {
  CUSTOM_RULES,
  FIELD_TYPES,
  SCHEMA_VERSION,
  VISIBILITY_OPERATORS,
  type CustomRuleConfig,
  type FieldOption,
  type FieldSchema,
  type FormSchema,
  type JsonImportResult,
  type ValidationConfig,
  type VisibilityCondition
} from "./types";

const OPTION_BASED_TYPES = new Set(["select", "radio"]);

export function createId(prefix = "field"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyName(value: string): string {
  const cleaned = value
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
    .replace(/^[^a-zA-Z_]+/, "");

  const normalized = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return normalized || "field";
}

export function makeUniqueName(baseName: string, fields: FieldSchema[], currentId?: string): string {
  const base = slugifyName(baseName);
  const names = new Set(fields.filter((field) => field.id !== currentId).map((field) => field.name));

  if (!names.has(base)) {
    return base;
  }

  let index = 2;
  while (names.has(`${base}${index}`)) {
    index += 1;
  }

  return `${base}${index}`;
}

export function createField(type: FieldSchema["type"], fields: FieldSchema[]): FieldSchema {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const name = makeUniqueName(type, fields);
  const baseField: FieldSchema = {
    id: createId(),
    type,
    label: `${typeLabel} field`,
    name,
    placeholder: "",
    helpText: "",
    required: false,
    defaultValue: type === "checkbox" ? false : ""
  };

  if (OPTION_BASED_TYPES.has(type)) {
    baseField.options = [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" }
    ];
  }

  return normalizeField(baseField, fields);
}

export function normalizeSchema(schema: FormSchema): FormSchema {
  const normalizedFields: FieldSchema[] = [];

  for (const field of schema.fields) {
    normalizedFields.push(normalizeField(field, normalizedFields));
  }

  return {
    version: schema.version || SCHEMA_VERSION,
    title: schema.title?.trim() || "Untitled form",
    description: schema.description?.trim() || "",
    fields: normalizedFields
  };
}

export function normalizeField(field: FieldSchema, existingFields: FieldSchema[]): FieldSchema {
  const type = FIELD_TYPES.includes(field.type) ? field.type : "text";
  const label = field.label?.trim() || "Untitled field";
  const normalized: FieldSchema = {
    id: field.id || createId(),
    type,
    label,
    name: makeUniqueName(field.name || label, existingFields, field.id),
    placeholder: field.placeholder ?? "",
    helpText: field.helpText ?? "",
    required: Boolean(field.required),
    defaultValue: normalizeDefaultValue(type, field.defaultValue),
    validation: normalizeValidation(field.validation),
    visibility: normalizeVisibility(field.visibility)
  };

  if (OPTION_BASED_TYPES.has(type)) {
    normalized.options = normalizeOptions(field.options);
    if (!normalized.defaultValue && normalized.options.length > 0) {
      normalized.defaultValue = "";
    }
  }

  return normalized;
}

export function normalizeDefaultValue(
  type: FieldSchema["type"],
  value: FieldSchema["defaultValue"]
): string | number | boolean {
  if (type === "checkbox") {
    return Boolean(value);
  }

  if (type === "number") {
    if (value === "" || value === undefined || value === null) {
      return "";
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : "";
  }

  if (value === undefined || value === null || typeof value === "boolean") {
    return "";
  }

  return String(value);
}

function normalizeOptions(options?: FieldOption[]): FieldOption[] {
  const safeOptions =
    options
      ?.map((option) => ({
        label: String(option.label ?? "").trim(),
        value: String(option.value ?? "").trim()
      }))
      .filter((option) => option.label && option.value) ?? [];

  if (safeOptions.length > 0) {
    return safeOptions;
  }

  return [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" }
  ];
}

function normalizeValidation(validation?: ValidationConfig): ValidationConfig | undefined {
  if (!validation) {
    return undefined;
  }

  const normalized: ValidationConfig = {};

  if (typeof validation.min === "number" && Number.isFinite(validation.min)) {
    normalized.min = validation.min;
  }

  if (typeof validation.max === "number" && Number.isFinite(validation.max)) {
    normalized.max = validation.max;
  }

  if (typeof validation.regex === "string" && validation.regex.trim()) {
    normalized.regex = validation.regex.trim();
  }

  const customRules = normalizeCustomRules(validation.customRules);
  if (customRules.length > 0) {
    normalized.customRules = customRules;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeCustomRules(rules?: CustomRuleConfig[]): CustomRuleConfig[] {
  return (
    rules
      ?.map((rule) => ({
        name: rule.name,
        value: rule.value?.trim()
      }))
      .filter((rule) => CUSTOM_RULES.includes(rule.name)) ?? []
  );
}

function normalizeVisibility(visibility?: VisibilityCondition): VisibilityCondition | undefined {
  if (!visibility?.fieldName || !VISIBILITY_OPERATORS.includes(visibility.operator)) {
    return undefined;
  }

  return {
    fieldName: visibility.fieldName,
    operator: visibility.operator,
    value: visibility.value
  };
}

export function parseSchemaJson(json: string): JsonImportResult {
  try {
    const parsed = JSON.parse(json) as unknown;
    const validationError = validateFormSchema(parsed);

    if (validationError) {
      return { ok: false, error: validationError };
    }

    return { ok: true, schema: normalizeSchema(parsed as FormSchema) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? `Invalid JSON: ${error.message}` : "Invalid JSON."
    };
  }
}

export function validateFormSchema(value: unknown): string | null {
  if (!isRecord(value)) {
    return "Schema must be a JSON object.";
  }

  if (typeof value.title !== "string" || !value.title.trim()) {
    return "Schema requires a non-empty title.";
  }

  if (!Array.isArray(value.fields)) {
    return "Schema requires a fields array.";
  }

  const names = new Set<string>();

  for (const [index, field] of value.fields.entries()) {
    if (!isRecord(field)) {
      return `Field ${index + 1} must be an object.`;
    }

    if (!FIELD_TYPES.includes(field.type as FieldSchema["type"])) {
      return `Field ${index + 1} has an unsupported type.`;
    }

    if (typeof field.label !== "string" || !field.label.trim()) {
      return `Field ${index + 1} requires a label.`;
    }

    if (typeof field.name !== "string" || !field.name.trim()) {
      return `Field ${index + 1} requires a name.`;
    }

    if (names.has(field.name)) {
      return `Field name "${field.name}" must be unique.`;
    }

    names.add(field.name);

    if (OPTION_BASED_TYPES.has(field.type as string)) {
      if (!Array.isArray(field.options) || field.options.length === 0) {
        return `${field.label} requires at least one option.`;
      }
    }

    if (isRecord(field.validation) && typeof field.validation.regex === "string") {
      try {
        new RegExp(field.validation.regex);
      } catch {
        return `${field.label} has an invalid regex.`;
      }
    }

    if (isRecord(field.visibility)) {
      const visibility = field.visibility;
      if (typeof visibility.fieldName !== "string" || !visibility.fieldName.trim()) {
        return `${field.label} has an invalid visibility field.`;
      }

      if (!VISIBILITY_OPERATORS.includes(visibility.operator as VisibilityCondition["operator"])) {
        return `${field.label} has an unsupported visibility operator.`;
      }
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
