import { Check, ChevronUp, Code2, Copy, Download, GripHorizontal, Upload } from "lucide-react";
import {
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { FormSchema } from "../schema/types";
import { parseSchemaJson } from "../schema/utils";

type JsonPanelProps = {
  schema: FormSchema;
  schemaHeight: number;
  schemaMinHeight: number;
  schemaMaxHeight: number;
  isResizing: boolean;
  onImport: (schema: FormSchema) => void;
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

export function JsonPanel({
  schema,
  schemaHeight,
  schemaMinHeight,
  schemaMaxHeight,
  isResizing,
  onImport,
  onResizeStart,
  onResizeKeyDown
}: JsonPanelProps) {
  const exportedJson = useMemo(() => JSON.stringify(schema, null, 2), [schema]);
  const [importJson, setImportJson] = useState(() => exportedJson);
  const [message, setMessage] = useState("Schema is ready to export.");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"json" | "import">("json");
  const liveLineNumbers = useMemo(() => exportedJson.split("\n").map((_, index) => index + 1), [exportedJson]);
  const importLineNumbers = useMemo(() => importJson.split("\n").map((_, index) => index + 1), [importJson]);

  function syncFromBuilder() {
    setImportJson(exportedJson);
    setActiveTab("import");
    setMessage("Import draft refreshed from the live schema.");
  }

  function importDraft() {
    const sourceJson = activeTab === "json" ? exportedJson : importJson;
    const result = parseSchemaJson(sourceJson);

    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    onImport(result.schema);
    setImportJson(JSON.stringify(result.schema, null, 2));
    setActiveTab("json");
    setMessage("Schema imported and hydrated successfully.");
  }

  async function copyJson() {
    await navigator.clipboard.writeText(exportedJson);
    setCopied(true);
    setMessage("Export JSON copied to clipboard.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  function formatJson() {
    if (activeTab === "json") {
      setMessage("Live schema is already formatted.");
      return;
    }

    try {
      setImportJson(JSON.stringify(JSON.parse(importJson), null, 2));
      setMessage("Import JSON formatted.");
    } catch (error) {
      setMessage(error instanceof Error ? `Invalid JSON: ${error.message}` : "Invalid JSON.");
    }
  }

  function downloadJson() {
    const blob = new Blob([exportedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "schema-studio-form.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("JSON export downloaded.");
  }

  function handleHeaderResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest(".schema-toolbar-actions")) {
      return;
    }

    onResizeStart(event);
  }

  return (
    <section className={`panel json-panel${isResizing ? " is-resizing" : ""}`} aria-labelledby="json-heading">
      <div
        className="schema-resize-bar"
        role="separator"
        aria-label="Resize schema panel"
        aria-orientation="horizontal"
        aria-valuemin={schemaMinHeight}
        aria-valuemax={schemaMaxHeight}
        aria-valuenow={schemaHeight}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onKeyDown={onResizeKeyDown}
      >
        <GripHorizontal size={18} aria-hidden="true" />
      </div>
      <div className="schema-drawer-header" onPointerDown={handleHeaderResizeStart}>
        <div>
          <h2 id="json-heading">Schema</h2>
        </div>
        <div className="panel-actions schema-toolbar-actions">
          <button type="button" className="secondary-button" onClick={formatJson}>
            <Code2 size={16} aria-hidden="true" />
            Format
          </button>
          <button type="button" className="secondary-button" onClick={copyJson}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            Copy
          </button>
          <button type="button" className="icon-button" onClick={downloadJson} aria-label="Download JSON schema">
            <Download size={16} aria-hidden="true" />
          </button>
          <button type="button" className="secondary-button" onClick={syncFromBuilder}>
            <Upload size={16} aria-hidden="true" />
            Refresh
          </button>
          <button type="button" className="primary-button" onClick={importDraft}>
            Hydrate preview
          </button>
          <button type="button" className="icon-button" disabled aria-label="Collapse schema drawer">
            <ChevronUp size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="schema-tabs" role="tablist" aria-label="Schema views">
        <button
          type="button"
          className={activeTab === "json" ? "is-active" : ""}
          onClick={() => setActiveTab("json")}
          role="tab"
          aria-selected={activeTab === "json"}
        >
          JSON
        </button>
        <button
          type="button"
          className={activeTab === "import" ? "is-active" : ""}
          onClick={() => setActiveTab("import")}
          role="tab"
          aria-selected={activeTab === "import"}
        >
          Import / Export
        </button>
      </div>

      {activeTab === "json" ? (
        <div className="code-editor-shell">
          <pre className="line-number-gutter" aria-hidden="true">
            {liveLineNumbers.join("\n")}
          </pre>
          <textarea
            className="json-editor"
            value={exportedJson}
            readOnly
            spellCheck={false}
            aria-label="Live JSON schema"
          />
        </div>
      ) : (
        <div className="code-editor-shell import-export-panel">
          <pre className="line-number-gutter" aria-hidden="true">
            {importLineNumbers.join("\n")}
          </pre>
          <textarea
            className="json-editor"
            value={importJson}
            onChange={(event) => setImportJson(event.target.value)}
            spellCheck={false}
            aria-label="Import JSON schema editor"
          />
        </div>
      )}

      <p className="status-line" role="status">
        {message}
      </p>
    </section>
  );
}
