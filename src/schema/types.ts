export const SCHEMA_VERSION = "1.0.0";

export const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "select",
  "radio",
  "checkbox",
  "date"
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const VISIBILITY_OPERATORS = ["equals", "notEquals", "exists"] as const;

export type VisibilityOperator = (typeof VISIBILITY_OPERATORS)[number];

export const CUSTOM_RULES = ["businessEmail", "startsWith", "mustBeTrue"] as const;

export type CustomRuleName = (typeof CUSTOM_RULES)[number];

export type FieldOption = {
  label: string;
  value: string;
};

export type CustomRuleConfig = {
  name: CustomRuleName;
  value?: string;
};

export type ValidationConfig = {
  min?: number;
  max?: number;
  regex?: string;
  customRules?: CustomRuleConfig[];
};

export type VisibilityCondition = {
  fieldName: string;
  operator: VisibilityOperator;
  value?: string | number | boolean;
};

export type FieldSchema = {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: FieldOption[];
  validation?: ValidationConfig;
  visibility?: VisibilityCondition;
};

export type FormSchema = {
  version: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
};

export type JsonImportResult =
  | { ok: true; schema: FormSchema }
  | { ok: false; error: string };

export type SubmitStatus = "idle" | "submitting" | "success" | "error";
