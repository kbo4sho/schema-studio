import type { ComponentPropsWithRef } from "react";
import type { FieldSchema } from "../../schema/types";
import { CheckboxField, RadioGroupField, SelectField, TextareaField, TextField } from "./FormControls";

type NativeInputProps = ComponentPropsWithRef<"input">;
type NativeSelectProps = ComponentPropsWithRef<"select">;
type NativeTextareaProps = ComponentPropsWithRef<"textarea">;

export type SchemaFieldControlProps = {
  inputProps?: NativeInputProps;
  selectProps?: NativeSelectProps;
  textareaProps?: NativeTextareaProps;
};

export type SchemaFormRendererProps = {
  fields: FieldSchema[];
  getFieldControlProps?: (field: FieldSchema) => SchemaFieldControlProps;
  getFieldError?: (field: FieldSchema) => string | undefined;
  onFieldSelect?: (field: FieldSchema) => void;
};

export function SchemaFormRenderer({
  fields,
  getFieldControlProps,
  getFieldError,
  onFieldSelect
}: SchemaFormRendererProps) {
  return (
    <>
      {fields.map((field) => (
        <SchemaField
          key={field.id}
          field={field}
          controlProps={getFieldControlProps?.(field)}
          error={getFieldError?.(field)}
          onFieldSelect={onFieldSelect}
        />
      ))}
    </>
  );
}

type SchemaFieldProps = {
  field: FieldSchema;
  controlProps?: SchemaFieldControlProps;
  error?: string;
  onFieldSelect?: (field: FieldSchema) => void;
};

function SchemaField({ field, controlProps, error, onFieldSelect }: SchemaFieldProps) {
  const id = `preview-${field.id}`;
  const rootProps = onFieldSelect
    ? {
        onFocusCapture: () => onFieldSelect(field),
        onPointerDownCapture: () => onFieldSelect(field)
      }
    : undefined;

  if (field.type === "textarea") {
    return (
      <TextareaField
        label={field.label}
        required={field.required}
        helpText={field.helpText}
        error={error}
        rootProps={rootProps}
        textareaProps={{ ...controlProps?.textareaProps, id, placeholder: field.placeholder }}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        label={field.label}
        required={field.required}
        helpText={field.helpText}
        error={error}
        rootProps={rootProps}
        placeholder={field.placeholder || "Select an option"}
        options={field.options ?? []}
        selectProps={{ ...controlProps?.selectProps, id }}
      />
    );
  }

  if (field.type === "radio") {
    return (
      <RadioGroupField
        label={field.label}
        required={field.required}
        helpText={field.helpText}
        error={error}
        rootProps={rootProps}
        options={field.options ?? []}
        inputProps={controlProps?.inputProps}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <CheckboxField
        label={field.label}
        required={field.required}
        helpText={field.helpText}
        error={error}
        fullWidth
        rootProps={rootProps}
        inputProps={{ ...controlProps?.inputProps, id }}
      />
    );
  }

  return (
    <TextField
      label={field.label}
      required={field.required}
      helpText={field.helpText}
      error={error}
      rootProps={rootProps}
      inputProps={{
        ...controlProps?.inputProps,
        id,
        type: field.type === "number" ? "number" : field.type === "date" ? "date" : "text",
        placeholder: field.placeholder
      }}
    />
  );
}
