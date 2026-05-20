import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { SchemaFormRenderer } from "./schema-renderer";
import type { FormSchema, SubmitStatus } from "../schema/types";
import {
  createDefaultValues,
  createZodSchema,
  getSubmissionPayload,
  getVisibleFields,
  type FormValues
} from "../schema/validation";

type FormPreviewProps = {
  schema: FormSchema;
  onSelectField: (fieldId: string) => void;
};

export function FormPreview({ schema, onSelectField }: FormPreviewProps) {
  const defaultValues = useMemo(() => createDefaultValues(schema), [schema]);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("Ready for a mock submission.");

  const form = useForm<FormValues>({
    defaultValues,
    mode: "onBlur",
    resolver: createDynamicResolver(schema)
  });

  const values = form.watch();
  const visibleFields = useMemo(() => getVisibleFields(schema, values), [schema, values]);

  useEffect(() => {
    form.reset(defaultValues);
    setSubmitStatus("idle");
    setSubmitMessage("Ready for a mock submission.");
  }, [defaultValues, form]);

  async function submitForm(values: FormValues) {
    setSubmitStatus("submitting");
    setSubmitMessage("Submitting mock enrollment...");

    await new Promise((resolve) => window.setTimeout(resolve, 1000));

    const succeeded = Math.random() > 0.35;
    if (succeeded) {
      setSubmitStatus("success");
      setSubmitMessage(`Mock submission accepted with ${Object.keys(getSubmissionPayload(schema, values)).length} fields.`);
    } else {
      setSubmitStatus("error");
      setSubmitMessage("Mock submission failed. Try again to exercise the error state.");
    }
  }

  return (
    <section className="panel preview-panel form-card" aria-labelledby="preview-heading">
      <div className="preview-card-header">
        <div>
          <h2 id="preview-heading">{schema.title}</h2>
          {schema.description ? <p>{schema.description}</p> : null}
        </div>
      </div>

      <form className="rendered-form" onSubmit={form.handleSubmit(submitForm)} noValidate>
        <SchemaFormRenderer
          fields={visibleFields}
          getFieldControlProps={(field) => {
            const controlProps = form.register(field.name);

            if (field.type === "textarea") {
              return { textareaProps: controlProps };
            }

            if (field.type === "select") {
              return { selectProps: controlProps };
            }

            return { inputProps: controlProps };
          }}
          getFieldError={(field) => {
            const error = form.formState.errors[field.name]?.message;
            return typeof error === "string" ? error : undefined;
          }}
          onFieldSelect={(field) => onSelectField(field.id)}
        />

        <button type="submit" className="primary-button submit-button field-span-full" disabled={submitStatus === "submitting"}>
          {submitStatus === "submitting" ? (
            <Loader2 className="spin" size={17} aria-hidden="true" />
          ) : (
            <Send size={17} aria-hidden="true" />
          )}
          Submit mock form
        </button>
      </form>

      <div className={`submit-state ${submitStatus} field-span-full`} role="status">
        {submitStatus === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
        {submitStatus === "error" ? <AlertCircle size={18} aria-hidden="true" /> : null}
        {submitStatus === "submitting" ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
        <span>{submitMessage}</span>
      </div>
    </section>
  );
}

function createDynamicResolver(schema: FormSchema): Resolver<FormValues> {
  return async (values, context, options) => {
    const resolver = zodResolver(createZodSchema(schema, values));
    const result = await resolver(values as Record<string, unknown>, context, options as never);
    return result as Awaited<ReturnType<Resolver<FormValues>>>;
  };
}
