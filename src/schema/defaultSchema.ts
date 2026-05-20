import { SCHEMA_VERSION, type FormSchema } from "./types";

export const defaultSchema: FormSchema = {
  version: SCHEMA_VERSION,
  title: "Employee Benefits Enrollment",
  description: "Please complete the form below to enroll in your benefits.",
  fields: [
    {
      id: "field-employee-name",
      type: "text",
      label: "Employee name",
      name: "employeeName",
      placeholder: "Enter your full name",
      helpText: "",
      required: true,
      validation: {
        min: 2
      }
    },
    {
      id: "field-work-email",
      type: "text",
      label: "Work email",
      name: "workEmail",
      placeholder: "jane@company.com",
      helpText: "We'll use this for benefit enrollment updates.",
      required: true,
      validation: {
        regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        customRules: [{ name: "businessEmail" }]
      }
    },
    {
      id: "field-country",
      type: "select",
      label: "Country",
      name: "country",
      placeholder: "Choose a country",
      helpText: "Country controls the eligibility details shown below.",
      required: true,
      defaultValue: "US",
      options: [
        { label: "United States", value: "US" },
        { label: "Canada", value: "CA" },
        { label: "United Kingdom", value: "UK" }
      ]
    },
    {
      id: "field-state",
      type: "select",
      label: "State",
      name: "state",
      placeholder: "Choose a state",
      helpText: "State is required when Country is United States.",
      required: true,
      defaultValue: "IL",
      options: [
        { label: "California", value: "CA" },
        { label: "Illinois", value: "IL" },
        { label: "New York", value: "NY" },
        { label: "Texas", value: "TX" }
      ],
      visibility: {
        fieldName: "country",
        operator: "equals",
        value: "US"
      }
    },
    {
      id: "field-benefit-type",
      type: "radio",
      label: "Benefit type",
      name: "benefitType",
      helpText: "",
      required: true,
      defaultValue: "health",
      options: [
        { label: "Health", value: "health" },
        { label: "Dental", value: "dental" },
        { label: "Vision", value: "vision" }
      ]
    },
    {
      id: "field-monthly-budget",
      type: "number",
      label: "Coverage amount",
      name: "coverageAmount",
      placeholder: "e.g., 1000",
      helpText: "Must be between 100 and 10000.",
      required: true,
      defaultValue: 1000,
      validation: {
        min: 100,
        max: 10000
      }
    },
    {
      id: "field-start-date",
      type: "date",
      label: "Preferred start date",
      name: "startDate",
      helpText: "Choose the date your benefit should become active.",
      required: true
    },
    {
      id: "field-notes",
      type: "textarea",
      label: "Additional notes",
      name: "notes",
      placeholder: "Any additional information...",
      helpText: "",
      required: false,
      validation: {
        max: 240
      }
    },
    {
      id: "field-acknowledgement",
      type: "checkbox",
      label: "I confirm this request follows company policy.",
      name: "policyAcknowledgement",
      helpText: "You must confirm before submitting.",
      required: true,
      defaultValue: false,
      validation: {
        customRules: [{ name: "mustBeTrue" }]
      }
    }
  ]
};
