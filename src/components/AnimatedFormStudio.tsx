import {
  Braces,
  Check,
  ChevronDown,
  CircleDot,
  Columns3,
  Copy,
  FileText,
  Layers3,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FormPreview } from "./FormPreview";
import { FIELD_TYPES, SCHEMA_VERSION, type FieldSchema, type FieldType, type FormSchema } from "../schema/types";
import { normalizeSchema } from "../schema/utils";

type CellKind = "section" | "field" | "rule" | "review";
type CellSpan = "standard" | "wide" | "tall";
type CanvasView = "cards" | "form";

type LayoutCell = {
  id: string;
  kind: CellKind;
  title: string;
  eyebrow: string;
  summary: string;
  metric: string;
  accent: string;
  span?: CellSpan;
  fieldNames?: string[];
};

type PresetConfiguration = {
  id: string;
  name: string;
  eyebrow: string;
  metric: string;
  icon: "treasury" | "credit" | "benefits";
  schema: FormSchema;
  cells: LayoutCell[];
};

const presetConfigurations: PresetConfiguration[] = [
  {
    id: "treasury-onboarding",
    name: "Treasury onboarding",
    eyebrow: "Operating account",
    metric: "9 fields / 4 controls",
    icon: "treasury",
    schema: normalizeSchema({
      version: SCHEMA_VERSION,
      title: "Treasury Operating Account",
      description: "Counterparty details, payment rails, and approval controls.",
      fields: [
        textField("treasury-legal-name", "Legal business name", "legalBusinessName", "Acme Capital LLC"),
        textField("treasury-tax-id", "Tax ID", "taxId", "XX-XXXXXXX"),
        selectField("treasury-region", "Operating region", "operatingRegion", "Choose a region", [
          ["United States", "us"],
          ["Canada", "ca"],
          ["United Kingdom", "uk"]
        ]),
        selectField("treasury-entity-type", "Entity type", "entityType", "Choose entity type", [
          ["LLC", "llc"],
          ["Corporation", "corporation"],
          ["Partnership", "partnership"]
        ]),
        numberField("treasury-monthly-volume", "Monthly payment volume", "monthlyPaymentVolume", "e.g. 250000"),
        selectField("treasury-funding-rail", "Primary funding rail", "primaryFundingRail", "Choose a rail", [
          ["ACH", "ach"],
          ["Wire", "wire"],
          ["Card settlement", "card"]
        ]),
        textField("treasury-approver-email", "Approver email", "approverEmail", "ops@company.com"),
        checkboxField("treasury-same-day-wire", "Enable same-day wire approval", "sameDayWireApproval", false),
        checkboxField("treasury-control-attestation", "I confirm treasury controls are approved.", "controlAttestation", true)
      ]
    }),
    cells: [
      cell("treasury-frame", "section", "Account frame", "Structure", "Four compact sections around identity, rails, controls, and review.", "4 sections", "#7b8cac", "wide", [
        "legalBusinessName",
        "operatingRegion"
      ]),
      cell("treasury-identity", "field", "Business identity", "Fields", "Legal name, Tax ID, region, and entity type sit as the opening cluster.", "4 fields", "#2563eb", "wide", [
        "legalBusinessName",
        "taxId",
        "operatingRegion",
        "entityType"
      ]),
      cell("treasury-volume", "field", "Payment profile", "Fields", "Monthly volume and funding rail define routing expectations.", "2 fields", "#d97706", "standard", [
        "monthlyPaymentVolume",
        "primaryFundingRail"
      ]),
      cell("treasury-approval", "rule", "Approval control", "Rule", "Approver email and same-day wire opt-in become the control checkpoint.", "2 controls", "#7c3aed", "standard", [
        "approverEmail",
        "sameDayWireApproval"
      ]),
      cell("treasury-review", "review", "Attestation handoff", "Review", "Final confirmation closes the payload before the JSON contract is copied.", "1 gate", "#be123c", "tall", [
        "controlAttestation"
      ])
    ]
  },
  {
    id: "working-capital",
    name: "Working capital line",
    eyebrow: "Credit intake",
    metric: "8 fields / 3 checks",
    icon: "credit",
    schema: normalizeSchema({
      version: SCHEMA_VERSION,
      title: "Working Capital Credit Line",
      description: "A compact intake for limit request, revenue context, and consent.",
      fields: [
        textField("credit-business-name", "Business name", "businessName", "Northstar Supply Co."),
        numberField("credit-requested-limit", "Requested limit", "requestedLimit", "e.g. 75000"),
        numberField("credit-annual-revenue", "Annual revenue", "annualRevenue", "e.g. 850000"),
        selectField("credit-collateral", "Collateral type", "collateralType", "Choose collateral", [
          ["Receivables", "receivables"],
          ["Inventory", "inventory"],
          ["Equipment", "equipment"]
        ]),
        dateField("credit-statements-date", "Latest statement date", "latestStatementDate"),
        textField("credit-owner", "Beneficial owner", "beneficialOwner", "Owner name"),
        textareaField("credit-risk-notes", "Risk notes", "riskNotes", "Optional notes"),
        checkboxField("credit-consent", "I consent to credit review.", "creditReviewConsent", true)
      ]
    }),
    cells: [
      cell("credit-limit", "section", "Limit request", "Structure", "The requested limit is anchored beside revenue to make the ratio visible.", "2 inputs", "#2563eb", "wide", [
        "requestedLimit",
        "annualRevenue"
      ]),
      cell("credit-business", "field", "Business profile", "Fields", "Business name, owner, and latest statements form the identity strip.", "3 fields", "#7b8cac", "wide", [
        "businessName",
        "beneficialOwner",
        "latestStatementDate"
      ]),
      cell("credit-collateral", "rule", "Collateral check", "Rule", "Collateral type and risk notes give underwriters the first signal.", "2 checks", "#d97706", "standard", [
        "collateralType",
        "riskNotes"
      ]),
      cell("credit-consent", "review", "Consent close", "Review", "The final checkbox makes the review state explicit before submission.", "1 gate", "#be123c", "tall", [
        "creditReviewConsent"
      ])
    ]
  },
  {
    id: "benefits-enrollment",
    name: "Benefits enrollment",
    eyebrow: "Employee form",
    metric: "9 fields / 2 branches",
    icon: "benefits",
    schema: normalizeSchema({
      version: SCHEMA_VERSION,
      title: "Employee Benefits Enrollment",
      description: "Identity, eligibility, coverage, and policy acknowledgement.",
      fields: [
        textField("benefits-employee-name", "Employee name", "employeeName", "Enter your full name"),
        textField("benefits-work-email", "Work email", "workEmail", "jane@company.com"),
        selectField("benefits-country", "Country", "country", "Choose a country", [
          ["United States", "US"],
          ["Canada", "CA"],
          ["United Kingdom", "UK"]
        ]),
        selectField("benefits-state", "State", "state", "Choose a state", [
          ["California", "CA"],
          ["Illinois", "IL"],
          ["New York", "NY"],
          ["Texas", "TX"]
        ]),
        selectField("benefits-tier", "Coverage tier", "coverageTier", "Choose a tier", [
          ["Employee", "employee"],
          ["Employee + spouse", "spouse"],
          ["Family", "family"]
        ]),
        numberField("benefits-amount", "Coverage amount", "coverageAmount", "e.g. 1000"),
        dateField("benefits-start-date", "Preferred start date", "startDate"),
        textareaField("benefits-notes", "Additional notes", "notes", "Any additional information"),
        checkboxField("benefits-acknowledgement", "I confirm this request follows company policy.", "policyAcknowledgement", true)
      ]
    }),
    cells: [
      cell("benefits-flow", "section", "Enrollment flow", "Structure", "Identity, eligibility, coverage, and confirmation stay visually separated.", "4 sections", "#7b8cac", "wide", [
        "employeeName",
        "coverageTier"
      ]),
      cell("benefits-person", "field", "Employee identity", "Fields", "Name and work email form the compact identity block.", "2 fields", "#2563eb", "standard", [
        "employeeName",
        "workEmail"
      ]),
      cell("benefits-eligibility", "rule", "Eligibility branch", "Rule", "Country and state sit together so conditional visibility reads clearly.", "2 fields", "#7c3aed", "standard", [
        "country",
        "state"
      ]),
      cell("benefits-coverage", "field", "Coverage choice", "Fields", "Tier, amount, and start date define the enrollment commitment.", "3 fields", "#d97706", "wide", [
        "coverageTier",
        "coverageAmount",
        "startDate"
      ]),
      cell("benefits-policy", "review", "Policy close", "Review", "Notes and acknowledgement complete the contract.", "2 fields", "#be123c", "tall", [
        "notes",
        "policyAcknowledgement"
      ])
    ]
  }
];

export function AnimatedFormStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [activeSchema, setActiveSchema] = useState<FormSchema | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<string | undefined>();
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [animationRun, setAnimationRun] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isPropertiesVisible, setIsPropertiesVisible] = useState(false);
  const [canvasView, setCanvasView] = useState<CanvasView>("cards");
  const [propertySaveMessage, setPropertySaveMessage] = useState("");
  const [isPropertySaveVisible, setIsPropertySaveVisible] = useState(false);
  const saveCompleteTimerRef = useRef<number | undefined>(undefined);
  const saveHideTimerRef = useRef<number | undefined>(undefined);
  const saveClearTimerRef = useRef<number | undefined>(undefined);

  const selectedPreset = presetConfigurations.find((preset) => preset.id === selectedPresetId);
  const schema = activeSchema ?? selectedPreset?.schema;
  const selectedCell = selectedPreset?.cells.find((cellItem) => cellItem.id === selectedCellId) ?? selectedPreset?.cells[0];
  const schemaJson = useMemo(() => JSON.stringify(schema ?? presetConfigurations[0].schema, null, 2), [schema]);
  const cellFields = useMemo(() => {
    if (!selectedPreset || !schema || !selectedCell?.fieldNames) {
      return [];
    }

    return selectedCell.fieldNames
      .map((fieldName) => selectedPreset.schema.fields.find((field) => field.name === fieldName)?.id)
      .map((fieldId) => schema.fields.find((field) => field.id === fieldId))
      .filter((field): field is FieldSchema => Boolean(field));
  }, [schema, selectedCell, selectedPreset]);
  const selectedField = useMemo(
    () => cellFields.find((field) => field.id === selectedFieldId) ?? cellFields[0],
    [cellFields, selectedFieldId]
  );

  useEffect(() => {
    return () => {
      clearPropertySaveTimers();
    };
  }, []);

  function clearPropertySaveTimers() {
    if (saveCompleteTimerRef.current) {
      window.clearTimeout(saveCompleteTimerRef.current);
      saveCompleteTimerRef.current = undefined;
    }
    if (saveHideTimerRef.current) {
      window.clearTimeout(saveHideTimerRef.current);
      saveHideTimerRef.current = undefined;
    }
    if (saveClearTimerRef.current) {
      window.clearTimeout(saveClearTimerRef.current);
      saveClearTimerRef.current = undefined;
    }
  }

  function resetPropertySaveConfirmation() {
    clearPropertySaveTimers();
    setPropertySaveMessage("");
    setIsPropertySaveVisible(false);
  }

  function queuePropertySaveConfirmation() {
    clearPropertySaveTimers();
    setPropertySaveMessage("Saving changes");
    setIsPropertySaveVisible(true);
    saveCompleteTimerRef.current = window.setTimeout(() => {
      setPropertySaveMessage("Changes saved");
      saveCompleteTimerRef.current = undefined;
    }, 360);
    saveHideTimerRef.current = window.setTimeout(() => {
      setIsPropertySaveVisible(false);
      saveHideTimerRef.current = undefined;
    }, 1800);
    saveClearTimerRef.current = window.setTimeout(() => {
      setPropertySaveMessage("");
      saveClearTimerRef.current = undefined;
    }, 2100);
  }

  function loadPreset(preset: PresetConfiguration) {
    const loadedSchema = normalizeSchema(preset.schema);
    const firstCell = preset.cells[0];
    const firstFieldId = firstCell?.fieldNames
      ?.map((fieldName) => preset.schema.fields.find((field) => field.name === fieldName)?.id)
      .find(Boolean);

    setSelectedPresetId(preset.id);
    setActiveSchema(loadedSchema);
    setSelectedCellId(firstCell?.id);
    setSelectedFieldId(firstFieldId);
    setCopied(false);
    setIsCodeVisible(false);
    setIsPropertiesVisible(false);
    setCanvasView("cards");
    resetPropertySaveConfirmation();
    setAnimationRun((run) => run + 1);
  }

  function replayAnimation() {
    setAnimationRun((run) => run + 1);
  }

  function selectCellForField(fieldId: string) {
    if (!selectedPreset) {
      return;
    }

    const field = selectedPreset.schema.fields.find((schemaField) => schemaField.id === fieldId);
    const matchingCell = selectedPreset.cells.find((canvasCell) => field && canvasCell.fieldNames?.includes(field.name));
    if (matchingCell) {
      setSelectedCellId(matchingCell.id);
      setSelectedFieldId(fieldId);
      resetPropertySaveConfirmation();
    }
  }

  async function copySchema() {
    if (!schema) {
      return;
    }

    await navigator.clipboard.writeText(schemaJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function selectCell(canvasCell: LayoutCell) {
    if (!selectedPreset) {
      return;
    }

    const firstFieldId = canvasCell.fieldNames
      ?.map((fieldName) => selectedPreset.schema.fields.find((field) => field.name === fieldName)?.id)
      .find(Boolean);
    setSelectedCellId(canvasCell.id);
    setSelectedFieldId(firstFieldId);
    resetPropertySaveConfirmation();
  }

  function patchSelectedField(patch: Partial<FieldSchema>) {
    if (!selectedField) {
      return;
    }

    setActiveSchema((currentSchema) => {
      if (!currentSchema) {
        return currentSchema;
      }

      return {
        ...currentSchema,
        fields: currentSchema.fields.map((field) => {
          if (field.id !== selectedField.id) {
            return field;
          }

          return prepareFieldPatch(field, patch);
        })
      };
    });
    queuePropertySaveConfirmation();
  }

  function updateSelectedFieldOptions(optionsText: string) {
    patchSelectedField({ options: parseOptionsText(optionsText) });
  }

  return (
    <main className={`animated-client-shell ${selectedPreset ? "has-selection" : "is-picking"}`}>
      <section className="preset-panel" aria-labelledby="preset-heading">
        <div className="studio-mark">
          <span className="studio-mark-icon">
            <Layers3 size={23} aria-hidden="true" />
          </span>
          <div>
            <h1>Intake Studio</h1>
            <p>Schema-backed form flows</p>
          </div>
        </div>

        <div className="preset-panel-heading">
          <p className="surface-kicker">Configurations</p>
          <h2 id="preset-heading">Load a form system</h2>
        </div>

        <div className="preset-list" aria-label="Predefined configurations">
          {presetConfigurations.map((preset) => (
            <button
              type="button"
              className={preset.id === selectedPresetId ? "preset-option is-selected" : "preset-option"}
              key={preset.id}
              onClick={() => loadPreset(preset)}
            >
              <PresetIcon icon={preset.icon} />
              <span>
                <strong>{preset.name}</strong>
                <small>{preset.eyebrow}</small>
              </span>
              <em>{preset.metric}</em>
            </button>
          ))}
        </div>
      </section>

      <section className={selectedPreset ? "motion-stage is-live" : "motion-stage"} aria-labelledby="stage-heading">
        {selectedPreset && schema ? (
          <div className="studio-frame" key={`${selectedPreset.id}-${animationRun}`}>
            <div className="stage-toolbar">
              <div>
                <p className="surface-kicker">Canvas</p>
                <h2 id="stage-heading">{schema.title}</h2>
              </div>
              <div className="stage-toolbar-controls">
                <div className="view-switch" aria-label="Canvas view">
                  <button
                    type="button"
                    className={canvasView === "cards" ? "is-active" : ""}
                    aria-pressed={canvasView === "cards"}
                    onClick={() => setCanvasView("cards")}
                  >
                    <Columns3 size={15} aria-hidden="true" />
                    Cards
                  </button>
                  <button
                    type="button"
                    className={canvasView === "form" ? "is-active" : ""}
                    aria-pressed={canvasView === "form"}
                    onClick={() => setCanvasView("form")}
                  >
                    <FileText size={15} aria-hidden="true" />
                    Form
                  </button>
                </div>
                <div className="stage-actions" aria-label="Canvas actions">
                  <button type="button" className="icon-button" onClick={replayAnimation} title="Replay animation">
                    <RotateCcw size={17} aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-button" onClick={copySchema} title="Copy schema JSON">
                    {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            {canvasView === "cards" ? (
              <div className="cell-canvas" aria-label={`${selectedPreset.name} form cells`}>
                {selectedPreset.cells.map((canvasCell, index) => (
                  <button
                    type="button"
                    className={`form-cell is-${canvasCell.kind} span-${canvasCell.span ?? "standard"}${
                      selectedCell?.id === canvasCell.id ? " is-selected" : ""
                    }`}
                    key={canvasCell.id}
                    style={
                      {
                        "--cell-accent": canvasCell.accent,
                        "--cell-delay": `${80 + index * 72}ms`
                      } as CSSProperties
                    }
                    onClick={() => selectCell(canvasCell)}
                  >
                    <span className="cell-topline">
                      <span>{canvasCell.eyebrow}</span>
                      <em>{canvasCell.metric}</em>
                    </span>
                    <strong>{canvasCell.title}</strong>
                    <span className="cell-summary">{canvasCell.summary}</span>
                    <span className="cell-kind">
                      <CircleDot size={13} aria-hidden="true" />
                      {canvasCell.kind}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="design-system-canvas" aria-label={`${selectedPreset.name} rendered form`}>
                <FormPreview schema={schema} onSelectField={selectCellForField} />
              </div>
            )}
          </div>
        ) : (
          <div className="empty-motion-state" aria-labelledby="stage-heading">
            <Sparkles size={22} aria-hidden="true" />
            <h2 id="stage-heading">No form loaded</h2>
          </div>
        )}
      </section>

      <aside className={selectedPreset ? "contract-panel is-live" : "contract-panel"} aria-label="Form contract">
        {selectedPreset && selectedCell ? (
          <>
            <div className="contract-header">
              <p className="surface-kicker">Contract</p>
              <div className="contract-title-row">
                <h2>{selectedCell.title}</h2>
                <button
                  type="button"
                  className={isCodeVisible ? "code-toggle is-active" : "code-toggle"}
                  aria-pressed={isCodeVisible}
                  onClick={() => setIsCodeVisible((visible) => !visible)}
                >
                  <Braces size={15} aria-hidden="true" />
                  Code
                </button>
              </div>
              <p>{selectedCell.summary}</p>
            </div>

            <div className="field-stack" aria-label="Fields in selected cell">
              {cellFields.map((field) => (
                <button
                  type="button"
                  className={selectedField?.id === field.id ? "field-token is-selected" : "field-token"}
                  key={field.id}
                  onClick={() => {
                    setSelectedFieldId(field.id);
                    resetPropertySaveConfirmation();
                  }}
                >
                  <span>
                    <strong>{field.label}</strong>
                    <small>{field.name}</small>
                  </span>
                  <em>{field.type}</em>
                </button>
              ))}
            </div>

            {selectedField ? (
              <div className="field-property-accordion">
                <button
                  type="button"
                  className="property-accordion-button"
                  aria-expanded={isPropertiesVisible}
                  aria-controls="field-properties-panel"
                  onClick={() => setIsPropertiesVisible((visible) => !visible)}
                >
                  <span>
                    <strong>
                      <SlidersHorizontal size={15} aria-hidden="true" />
                      Properties
                    </strong>
                    <small>{selectedField.label || "Untitled field"}</small>
                  </span>
                  <ChevronDown className={isPropertiesVisible ? "is-open" : ""} size={17} aria-hidden="true" />
                </button>

                {isPropertiesVisible ? (
                  <div className="field-property-editor" id="field-properties-panel" aria-label="Field properties">
                    <div className="property-editor-heading">
                      <div>
                        <p className="surface-kicker">Editing</p>
                        <h3>{selectedField.label || "Untitled field"}</h3>
                      </div>
                      <div
                        className={
                          isPropertySaveVisible && propertySaveMessage
                            ? "property-save-status is-visible"
                            : "property-save-status"
                        }
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {propertySaveMessage ? (
                          <>
                            {propertySaveMessage === "Changes saved" ? <Check size={13} aria-hidden="true" /> : null}
                            <span>{propertySaveMessage}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <label>
                      <span>Label</span>
                      <input
                        value={selectedField.label}
                        onChange={(event) => patchSelectedField({ label: event.target.value })}
                      />
                    </label>

                    <label>
                      <span>Name</span>
                      <input
                        value={selectedField.name}
                        onChange={(event) => patchSelectedField({ name: event.target.value })}
                      />
                    </label>

                    <label>
                      <span>Type</span>
                      <select
                        value={selectedField.type}
                        onChange={(event) => patchSelectedField({ type: event.target.value as FieldType })}
                      >
                        {FIELD_TYPES.map((fieldType) => (
                          <option key={fieldType} value={fieldType}>
                            {fieldType}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Placeholder</span>
                      <input
                        value={selectedField.placeholder ?? ""}
                        onChange={(event) => patchSelectedField({ placeholder: event.target.value })}
                      />
                    </label>

                    <label>
                      <span>Help text</span>
                      <textarea
                        value={selectedField.helpText ?? ""}
                        onChange={(event) => patchSelectedField({ helpText: event.target.value })}
                      />
                    </label>

                    <label className="property-toggle-row">
                      <span>Required</span>
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(event) => patchSelectedField({ required: event.target.checked })}
                      />
                      <span className="toggle-track" aria-hidden="true" />
                    </label>

                    {selectedField.type === "select" || selectedField.type === "radio" ? (
                      <label>
                        <span>Options</span>
                        <textarea
                          className="options-editor"
                          value={formatOptionsText(selectedField.options)}
                          onChange={(event) => updateSelectedFieldOptions(event.target.value)}
                        />
                      </label>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {isCodeVisible ? (
              <div className="json-mini-panel" id="schema-json-panel">
                <div>
                  <Braces size={16} aria-hidden="true" />
                  <span>Schema JSON</span>
                </div>
                <pre>{schemaJson}</pre>
              </div>
            ) : null}
          </>
        ) : null}
      </aside>
    </main>
  );
}

function prepareFieldPatch(field: FieldSchema, patch: Partial<FieldSchema>): FieldSchema {
  const nextField: FieldSchema = { ...field, ...patch };

  if (patch.type && patch.type !== field.type) {
    if (patch.type === "select" || patch.type === "radio") {
      nextField.options = field.options ?? [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" }
      ];
      nextField.defaultValue = "";
    } else {
      delete nextField.options;
      nextField.defaultValue = patch.type === "checkbox" ? false : "";
    }
  }

  if (patch.options) {
    nextField.options = patch.options;
  }

  return nextField;
}

function formatOptionsText(options?: FieldSchema["options"]) {
  return options?.map((option) => `${option.label} | ${option.value}`).join("\n") ?? "";
}

function parseOptionsText(optionsText: string) {
  const options = optionsText
    .split("\n")
    .map((line) => {
      const [rawLabel, rawValue] = line.split("|");
      const label = rawLabel?.trim() ?? "";
      const value = rawValue?.trim() || label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      return { label, value };
    })
    .filter((option) => option.label && option.value);

  return options.length > 0
    ? options
    : [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" }
      ];
}

function PresetIcon({ icon }: { icon: PresetConfiguration["icon"] }) {
  if (icon === "credit") {
    return <SlidersHorizontal size={18} aria-hidden="true" />;
  }

  if (icon === "benefits") {
    return <ShieldCheck size={18} aria-hidden="true" />;
  }

  return <WalletCards size={18} aria-hidden="true" />;
}

function cell(
  id: string,
  kind: CellKind,
  title: string,
  eyebrow: string,
  summary: string,
  metric: string,
  accent: string,
  span: CellSpan = "standard",
  fieldNames: string[] = []
): LayoutCell {
  return { id, kind, title, eyebrow, summary, metric, accent, span, fieldNames };
}

function textField(id: string, label: string, name: string, placeholder: string): FieldSchema {
  return {
    id,
    type: "text",
    label,
    name,
    placeholder,
    helpText: "",
    required: true,
    validation: { min: 2 }
  };
}

function numberField(id: string, label: string, name: string, placeholder: string): FieldSchema {
  return {
    id,
    type: "number",
    label,
    name,
    placeholder,
    helpText: "",
    required: true,
    validation: { min: 1 }
  };
}

function dateField(id: string, label: string, name: string): FieldSchema {
  return {
    id,
    type: "date",
    label,
    name,
    helpText: "",
    required: true
  };
}

function textareaField(id: string, label: string, name: string, placeholder: string): FieldSchema {
  return {
    id,
    type: "textarea",
    label,
    name,
    placeholder,
    helpText: "",
    required: false,
    validation: { max: 240 }
  };
}

function checkboxField(id: string, label: string, name: string, required: boolean): FieldSchema {
  return {
    id,
    type: "checkbox",
    label,
    name,
    helpText: "",
    required,
    defaultValue: false
  };
}

function selectField(
  id: string,
  label: string,
  name: string,
  placeholder: string,
  options: Array<[string, string]>
): FieldSchema {
  return {
    id,
    type: "select",
    label,
    name,
    placeholder,
    helpText: "",
    required: true,
    options: options.map(([optionLabel, value]) => ({ label: optionLabel, value }))
  };
}
