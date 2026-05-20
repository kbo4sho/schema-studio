import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckboxField, RadioGroupField, SelectField, TextField } from ".";

describe("DS form controls", () => {
  it("renders text field labels, required state, help text, and errors", () => {
    render(
      <TextField
        label="Work email"
        required
        helpText="Use your business email."
        error="This field is required."
        inputProps={{ id: "work-email" }}
      />
    );

    const input = screen.getByLabelText(/Work email/);

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Use your business email.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("This field is required.");
  });

  it("passes native props through to select controls", () => {
    render(
      <SelectField
        label="Country"
        placeholder="Choose a country"
        selectProps={{ id: "country", name: "country" }}
        options={[
          { label: "United States", value: "US" },
          { label: "Canada", value: "CA" }
        ]}
      />
    );

    const select = screen.getByLabelText("Country");

    expect(select).toHaveAttribute("name", "country");
    expect(screen.getByRole("option", { name: "Choose a country" })).toHaveValue("");
    expect(screen.getByRole("option", { name: "Canada" })).toHaveValue("CA");
  });

  it("keeps radio labels clickable", () => {
    render(
      <RadioGroupField
        label="Benefit type"
        options={[
          { label: "Health", value: "health" },
          { label: "Dental", value: "dental" }
        ]}
        inputProps={{ name: "benefitType" }}
      />
    );

    fireEvent.click(screen.getByText("Dental"));

    expect(screen.getByLabelText("Dental")).toBeChecked();
  });

  it("keeps checkbox labels clickable", () => {
    render(<CheckboxField label="I confirm this request follows company policy." inputProps={{ id: "confirm" }} />);

    fireEvent.click(screen.getByText("I confirm this request follows company policy."));

    expect(screen.getByLabelText("I confirm this request follows company policy.")).toBeChecked();
  });
});
