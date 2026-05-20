import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FieldSchema } from "../../schema/types";
import { SchemaFormRenderer } from ".";

const fields: FieldSchema[] = [
  {
    id: "field-employee-name",
    type: "text",
    label: "Employee name",
    name: "employeeName",
    placeholder: "Enter your full name",
    helpText: "Use your legal name.",
    required: true
  },
  {
    id: "field-start-date",
    type: "date",
    label: "Preferred start date",
    name: "startDate",
    required: true
  },
  {
    id: "field-coverage-amount",
    type: "number",
    label: "Coverage amount",
    name: "coverageAmount",
    required: true
  },
  {
    id: "field-notes",
    type: "textarea",
    label: "Additional notes",
    name: "notes",
    placeholder: "Any additional information...",
    helpText: "Optional context.",
    required: false
  },
  {
    id: "field-country",
    type: "select",
    label: "Country",
    name: "country",
    placeholder: "Choose a country",
    helpText: "Country controls eligibility.",
    required: true,
    options: [
      { label: "United States", value: "US" },
      { label: "Canada", value: "CA" }
    ]
  },
  {
    id: "field-benefit-type",
    type: "radio",
    label: "Benefit type",
    name: "benefitType",
    required: true,
    options: [
      { label: "Health", value: "health" },
      { label: "Dental", value: "dental" }
    ]
  },
  {
    id: "field-acknowledgement",
    type: "checkbox",
    label: "I confirm this request follows company policy.",
    name: "policyAcknowledgement",
    helpText: "You must confirm before submitting.",
    required: true
  }
];

describe("SchemaFormRenderer", () => {
  it("renders each supported schema field type through DS controls", () => {
    render(<SchemaFormRenderer fields={fields} />);

    expect(screen.getByLabelText(/Employee name/)).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/Preferred start date/)).toHaveAttribute("type", "date");
    expect(screen.getByLabelText(/Coverage amount/)).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("Additional notes")).toBeInstanceOf(HTMLTextAreaElement);
    expect(screen.getByLabelText(/Country/)).toBeInstanceOf(HTMLSelectElement);
    expect(screen.getByLabelText("Health")).toHaveAttribute("type", "radio");
    expect(screen.getByLabelText(/I confirm this request follows company policy/)).toHaveAttribute("type", "checkbox");
  });

  it("passes native control props to the matching underlying control", () => {
    render(
      <SchemaFormRenderer
        fields={fields}
        getFieldControlProps={(field) => {
          if (field.type === "textarea") {
            return { textareaProps: { name: field.name, "data-testid": `${field.name}-textarea` } };
          }

          if (field.type === "select") {
            return { selectProps: { name: field.name, "data-testid": `${field.name}-select` } };
          }

          return { inputProps: { name: field.name, "data-testid": `${field.name}-input` } };
        }}
      />
    );

    expect(screen.getByTestId("employeeName-input")).toHaveAttribute("id", "preview-field-employee-name");
    expect(screen.getByTestId("employeeName-input")).toHaveAttribute("placeholder", "Enter your full name");
    expect(screen.getByTestId("notes-textarea")).toHaveAttribute("id", "preview-field-notes");
    expect(screen.getByTestId("country-select")).toHaveAttribute("name", "country");
    expect(screen.getByRole("option", { name: "Choose a country" })).toHaveValue("");
  });

  it("renders help text and field errors", () => {
    render(
      <SchemaFormRenderer
        fields={fields}
        getFieldError={(field) => (field.name === "employeeName" ? "This field is required." : undefined)}
      />
    );

    expect(screen.getByText("Use your legal name.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("This field is required.");
    expect(screen.getByLabelText(/Employee name/)).toHaveAttribute("aria-invalid", "true");
  });

  it("invokes field selection on pointer and focus interactions", () => {
    const onFieldSelect = vi.fn();

    render(<SchemaFormRenderer fields={fields} onFieldSelect={onFieldSelect} />);

    const employeeName = screen.getByLabelText(/Employee name/);

    fireEvent.pointerDown(employeeName);
    fireEvent.focus(employeeName);

    expect(onFieldSelect).toHaveBeenCalledTimes(2);
    expect(onFieldSelect).toHaveBeenLastCalledWith(fields[0]);
  });

  it("renders checkbox fields as full-width controls", () => {
    render(<SchemaFormRenderer fields={[fields[6]]} />);

    const checkboxRoot = screen.getByLabelText(/I confirm this request follows company policy/).closest("div");

    expect(checkboxRoot?.className).toContain("fullWidth");
  });
});
