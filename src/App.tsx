import { FolderOpen, Layers3, RotateCcw, Save } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { FieldEditor } from "./components/FieldEditor";
import { FieldList } from "./components/FieldList";
import { FormPreview } from "./components/FormPreview";
import { JsonPanel } from "./components/JsonPanel";
import { defaultSchema } from "./schema/defaultSchema";
import { loadSchema, resetSavedSchema, saveSchema } from "./schema/storage";
import type { FieldSchema, FormSchema } from "./schema/types";
import { normalizeSchema } from "./schema/utils";

const initialSchema = normalizeSchema(defaultSchema);
const DEFAULT_SCHEMA_PANEL_HEIGHT = 286;
const MIN_SCHEMA_PANEL_HEIGHT = 180;
const MAX_SCHEMA_PANEL_HEIGHT = 560;
const SCHEMA_PANEL_KEY_STEP = 24;

function getMaxSchemaPanelHeight() {
  if (typeof window === "undefined") {
    return MAX_SCHEMA_PANEL_HEIGHT;
  }

  const toolbarHeight = 64;
  const minimumWorkspaceHeight = 320;
  const availableHeight = window.innerHeight - toolbarHeight - minimumWorkspaceHeight;
  return Math.max(MIN_SCHEMA_PANEL_HEIGHT, Math.min(MAX_SCHEMA_PANEL_HEIGHT, availableHeight));
}

function clampSchemaPanelHeight(value: number) {
  return Math.min(Math.max(value, MIN_SCHEMA_PANEL_HEIGHT), getMaxSchemaPanelHeight());
}

export default function App() {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(schema.fields[0]?.id);
  const [storageMessage, setStorageMessage] = useState("Use Save when the schema looks right.");
  const [schemaPanelHeight, setSchemaPanelHeight] = useState(DEFAULT_SCHEMA_PANEL_HEIGHT);
  const [isSchemaResizing, setIsSchemaResizing] = useState(false);
  const schemaResizeState = useRef<{ startY: number; startHeight: number } | null>(null);

  const selectedField = useMemo(
    () => schema.fields.find((field) => field.id === selectedFieldId) ?? schema.fields[0],
    [schema.fields, selectedFieldId]
  );
  const schemaPanelMaxHeight = getMaxSchemaPanelHeight();
  const studioLayoutStyle = {
    "--schema-panel-height": `${schemaPanelHeight}px`
  } as CSSProperties;

  useEffect(() => {
    if (!isSchemaResizing) {
      return undefined;
    }

    function handlePointerMove(event: PointerEvent) {
      if (!schemaResizeState.current) {
        return;
      }

      const delta = schemaResizeState.current.startY - event.clientY;
      setSchemaPanelHeight(clampSchemaPanelHeight(schemaResizeState.current.startHeight + delta));
    }

    function stopResizing() {
      schemaResizeState.current = null;
      setIsSchemaResizing(false);
    }

    document.body.classList.add("is-resizing-schema");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      document.body.classList.remove("is-resizing-schema");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isSchemaResizing]);

  function updateSchema(nextSchema: FormSchema) {
    setSchema(normalizeSchema(nextSchema));
  }

  function updateFields(fields: FieldSchema[]) {
    updateSchema({ ...schema, fields });
  }

  function updateField(updatedField: FieldSchema) {
    updateFields(schema.fields.map((field) => (field.id === updatedField.id ? updatedField : field)));
  }

  function handleSave() {
    saveSchema(schema);
    setStorageMessage("Saved to localStorage.");
  }

  function handleLoad() {
    const result = loadSchema();
    if (result.ok) {
      setSchema(result.schema);
      setSelectedFieldId(result.schema.fields[0]?.id);
      setStorageMessage("Loaded saved schema from localStorage.");
    } else {
      setStorageMessage(result.error);
    }
  }

  function handleReset() {
    const resetSchema = resetSavedSchema();
    setSchema(resetSchema);
    setSelectedFieldId(resetSchema.fields[0]?.id);
    setStorageMessage("Reset to the seeded benefits example.");
  }

  function handleImport(importedSchema: FormSchema) {
    setSchema(importedSchema);
    setSelectedFieldId(importedSchema.fields[0]?.id);
  }

  function handleSchemaResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    schemaResizeState.current = {
      startY: event.clientY,
      startHeight: schemaPanelHeight
    };
    setIsSchemaResizing(true);
  }

  function handleSchemaResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const keySteps: Record<string, number> = {
      ArrowUp: SCHEMA_PANEL_KEY_STEP,
      ArrowDown: -SCHEMA_PANEL_KEY_STEP,
      PageUp: SCHEMA_PANEL_KEY_STEP * 3,
      PageDown: -SCHEMA_PANEL_KEY_STEP * 3
    };

    if (event.key === "Home") {
      event.preventDefault();
      setSchemaPanelHeight(MIN_SCHEMA_PANEL_HEIGHT);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setSchemaPanelHeight(schemaPanelMaxHeight);
      return;
    }

    const step = keySteps[event.key];
    if (step === undefined) {
      return;
    }

    event.preventDefault();
    setSchemaPanelHeight((height) => clampSchemaPanelHeight(height + step));
  }

  return (
    <main className="app-shell">
      <header className="app-toolbar">
        <div className="toolbar-brand" aria-label="Schema Studio">
          <Layers3 size={30} aria-hidden="true" />
          <h1>Schema Studio</h1>
        </div>

        <div className="toolbar-actions" aria-label="Persistence controls">
          <button type="button" className="primary-button toolbar-button" onClick={handleSave}>
            <Save size={16} aria-hidden="true" />
            Save
          </button>
          <button type="button" className="secondary-button toolbar-button" onClick={handleLoad}>
            <FolderOpen size={16} aria-hidden="true" />
            Load
          </button>
          <button type="button" className="secondary-button toolbar-button" onClick={handleReset}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
        </div>

        <p className="storage-status" role="status">
          {storageMessage}
        </p>
      </header>

      <div className="studio-layout" style={studioLayoutStyle}>
        <div className="builder-area">
          <FieldList
            fields={schema.fields}
            selectedFieldId={selectedField?.id}
            onFieldsChange={updateFields}
            onSelectField={setSelectedFieldId}
          />
        </div>

        <section className="canvas-area" aria-label="Preview canvas">
          <div className="canvas-header">
            <h2>Preview</h2>
          </div>
          <div className="preview-stage">
            <FormPreview schema={schema} onSelectField={setSelectedFieldId} />
          </div>
        </section>

        <div className="inspector-area">
          <FieldEditor
            field={selectedField}
            fields={schema.fields}
            onChange={updateField}
            onSelectField={setSelectedFieldId}
          />
        </div>

        <div className="schema-area">
          <JsonPanel
            schema={schema}
            schemaHeight={schemaPanelHeight}
            schemaMinHeight={MIN_SCHEMA_PANEL_HEIGHT}
            schemaMaxHeight={schemaPanelMaxHeight}
            isResizing={isSchemaResizing}
            onImport={handleImport}
            onResizeStart={handleSchemaResizeStart}
            onResizeKeyDown={handleSchemaResizeKeyDown}
          />
        </div>
      </div>
    </main>
  );
}
