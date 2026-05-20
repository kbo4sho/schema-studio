import { useState } from "react";
import {
  CUSTOM_RULES,
  FIELD_TYPES,
  VISIBILITY_OPERATORS,
  type CustomRuleName,
  type FieldSchema,
  type FieldType,
  type ValidationConfig,
  type VisibilityOperator
} from "../schema/types";
import { makeUniqueName, normalizeDefaultValue, normalizeField } from "../schema/utils";

type FieldEditorProps = {
  field?: FieldSchema;
  fields: FieldSchema[];
  onChange: (field: FieldSchema) => void;
  onSelectField: (fieldId: string) => void;
};

const OPTION_TYPES = new Set<FieldType>(["select", "radio"]);

export function FieldEditor({ field, fields, onChange, onSelectField }: FieldEditorProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "validation">("settings");

  if (!field) {
    return (
      <section className="panel inspector-panel" aria-labelledby="inspector-heading">
        <div className="inspector-header">
          <h2 id="inspector-heading">Inspector</h2>
        </div>
        <p className="empty-state">Add or select a field to edit its properties.</p>
      </section>
    );
  }

  const availableConditionFields = fields.filter((candidate) => candidate.id !== field.id);
  const customRule = field.validation?.customRules?.[0];

  function updateField(patch: Partial<FieldSchema>) {
    onChange(normalizeField({ ...field!, ...patch }, fields.filter((item) => item.id !== field!.id)));
  }

  function updateValidation(patch: Partial<ValidationConfig>) {
    const nextValidation = {
      ...(field!.validation ?? {}),
      ...patch
    };

    for (const key of Object.keys(nextValidation) as (keyof ValidationConfig)[]) {
      const value = nextValidation[key];
      if (value === "" || value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete nextValidation[key];
      }
    }

    updateField({
      validation: Object.keys(nextValidation).length > 0 ? nextValidation : undefined
    });
  }

  function updateOption(index: number, key: "label" | "value", value: string) {
    const options = [...(field!.options ?? [])];
    options[index] = { ...options[index], [key]: value };
    updateField({ options });
  }

  function addOption() {
    const nextIndex = (field!.options?.length ?? 0) + 1;
    updateField({
      options: [
        ...(field!.options ?? []),
        { label: `Option ${nextIndex}`, value: `option_${nextIndex}` }
      ]
    });
  }

  function removeOption(index: number) {
    updateField({ options: field!.options?.filter((_, optionIndex) => optionIndex !== index) ?? [] });
  }

  return (
    <section className="panel inspector-panel" aria-labelledby="inspector-heading">
      <div className="inspector-header">
        <h2 id="inspector-heading">Inspector</h2>
      </div>

      <label className="field-picker">
        <span>Field</span>
        <select value={field.id} onChange={(event) => onSelectField(event.target.value)}>
          {fields.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.label} ({candidate.type})
            </option>
          ))}
        </select>
      </label>

      <div className="inspector-tabs" role="tablist" aria-label="Inspector sections">
        <button
          type="button"
          className={activeTab === "settings" ? "is-active" : ""}
          onClick={() => setActiveTab("settings")}
          role="tab"
          aria-selected={activeTab === "settings"}
        >
          Settings
        </button>
        <button
          type="button"
          className={activeTab === "validation" ? "is-active" : ""}
          onClick={() => setActiveTab("validation")}
          role="tab"
          aria-selected={activeTab === "validation"}
        >
          Validation & Logic
        </button>
      </div>

      {activeTab === "settings" ? (
      <div className="form-grid compact inspector-section-body">
        <label>
          <span>Label</span>
          <input
            value={field.label}
            onChange={(event) => {
              const label = event.target.value;
              updateField({
                label,
                name: field.name ? field.name : makeUniqueName(label, fields, field.id)
              });
            }}
          />
        </label>

        <label>
          <span>Name</span>
          <input value={field.name} onChange={(event) => updateField({ name: event.target.value })} aria-describedby="name-help" />
          <small id="name-help">Used as the JSON key and form field identifier.</small>
        </label>

        <label>
          <span>Type</span>
          <select
            value={field.type}
            onChange={(event) => {
              const type = event.target.value as FieldType;
              updateField({
                type,
                defaultValue: normalizeDefaultValue(type, field.defaultValue),
                options: OPTION_TYPES.has(type) ? field.options : undefined
              });
            }}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Placeholder</span>
          <input
            value={field.placeholder ?? ""}
            onChange={(event) => updateField({ placeholder: event.target.value })}
            disabled={field.type === "checkbox" || field.type === "radio"}
          />
        </label>

        <label className="span-2">
          <span>Help text</span>
          <textarea value={field.helpText ?? ""} onChange={(event) => updateField({ helpText: event.target.value })} />
        </label>

        <label>
          <span>Default value</span>
          {field.type === "checkbox" ? (
            <select
              value={String(Boolean(field.defaultValue))}
              onChange={(event) => updateField({ defaultValue: event.target.value === "true" })}
            >
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          ) : (
            <input
              type={field.type === "number" ? "number" : "text"}
              value={String(field.defaultValue ?? "")}
              onChange={(event) =>
                updateField({
                  defaultValue:
                    field.type === "number" && event.target.value !== ""
                      ? Number(event.target.value)
                      : event.target.value
                })
              }
            />
          )}
        </label>
      </div>
      ) : (
      <div className="inspector-section-body">

      {OPTION_TYPES.has(field.type) ? (
        <div className="editor-section">
          <div className="section-heading">
            <h3>Options</h3>
            <button type="button" className="small-button" onClick={addOption}>
              Add option
            </button>
          </div>
          <div className="option-editor">
            {(field.options ?? []).map((option, index) => (
              <div className="option-row" key={`${option.value}-${index}`}>
                <input
                  value={option.label}
                  onChange={(event) => updateOption(index, "label", event.target.value)}
                  aria-label={`Option ${index + 1} label`}
                />
                <input
                  value={option.value}
                  onChange={(event) => updateOption(index, "value", event.target.value)}
                  aria-label={`Option ${index + 1} value`}
                />
                <button type="button" className="small-button danger" onClick={() => removeOption(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="editor-section">
        <h3>Validation</h3>
        <div className="form-grid compact">
          <label className="toggle-row span-2">
            <span>Required</span>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(event) => updateField({ required: event.target.checked })}
            />
            <span className="toggle-track" aria-hidden="true" />
          </label>
          <label>
            <span>{field.type === "number" ? "Minimum value" : "Minimum length"}</span>
            <input
              type="number"
              value={field.validation?.min ?? ""}
              onChange={(event) =>
                updateValidation({
                  min: event.target.value === "" ? undefined : Number(event.target.value)
                })
              }
            />
          </label>
          <label>
            <span>{field.type === "number" ? "Maximum value" : "Maximum length"}</span>
            <input
              type="number"
              value={field.validation?.max ?? ""}
              onChange={(event) =>
                updateValidation({
                  max: event.target.value === "" ? undefined : Number(event.target.value)
                })
              }
            />
          </label>
          <label className="span-2">
            <span>Regex</span>
            <input
              value={field.validation?.regex ?? ""}
              onChange={(event) => updateValidation({ regex: event.target.value || undefined })}
              placeholder="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
              disabled={field.type === "checkbox" || field.type === "number"}
            />
          </label>
          <label>
            <span>Custom rule</span>
            <select
              value={customRule?.name ?? ""}
              onChange={(event) => {
                const value = event.target.value as CustomRuleName | "";
                updateValidation({
                  customRules: value ? [{ name: value }] : undefined
                });
              }}
            >
              <option value="">None</option>
              {CUSTOM_RULES.map((rule) => (
                <option key={rule} value={rule}>
                  {rule}
                </option>
              ))}
            </select>
          </label>
          {customRule?.name === "startsWith" ? (
            <label>
              <span>Rule value</span>
              <input
                value={customRule.value ?? ""}
                onChange={(event) =>
                  updateValidation({
                    customRules: [{ ...customRule, value: event.target.value }]
                  })
                }
              />
            </label>
          ) : null}
        </div>
      </div>

      <div className="editor-section">
        <h3>Visibility</h3>
        <div className="form-grid compact">
          <label>
            <span>Show when field</span>
            <select
              value={field.visibility?.fieldName ?? ""}
              onChange={(event) => {
                const fieldName = event.target.value;
                updateField({
                  visibility: fieldName
                    ? {
                        fieldName,
                        operator: field.visibility?.operator ?? "equals",
                        value: field.visibility?.value ?? ""
                      }
                    : undefined
                });
              }}
            >
              <option value="">Always visible</option>
              {availableConditionFields.map((candidate) => (
                <option key={candidate.id} value={candidate.name}>
                  {candidate.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Operator</span>
            <select
              value={field.visibility?.operator ?? "equals"}
              onChange={(event) => {
                if (!field.visibility) {
                  return;
                }
                updateField({
                  visibility: {
                    ...field.visibility,
                    operator: event.target.value as VisibilityOperator
                  }
                });
              }}
              disabled={!field.visibility}
            >
              {VISIBILITY_OPERATORS.map((operator) => (
                <option key={operator} value={operator}>
                  {operator}
                </option>
              ))}
            </select>
          </label>

          <label className="span-2">
            <span>Value</span>
            <input
              value={String(field.visibility?.value ?? "")}
              onChange={(event) => {
                if (!field.visibility) {
                  return;
                }
                updateField({
                  visibility: {
                    ...field.visibility,
                    value: event.target.value
                  }
                });
              }}
              disabled={!field.visibility || field.visibility.operator === "exists"}
            />
          </label>
        </div>
      </div>
      </div>
      )}
    </section>
  );
}
