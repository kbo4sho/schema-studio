import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FIELD_TYPES, type FieldSchema, type FieldType } from "../schema/types";
import { createField } from "../schema/utils";
import { SortableFieldItem } from "./SortableFieldItem";

type FieldListProps = {
  fields: FieldSchema[];
  selectedFieldId?: string;
  onFieldsChange: (fields: FieldSchema[]) => void;
  onSelectField: (fieldId: string) => void;
};

export function FieldList({ fields, selectedFieldId, onFieldsChange, onSelectField }: FieldListProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function addField(type: FieldType) {
    const field = createField(type, fields);
    onFieldsChange([...fields, field]);
    onSelectField(field.id);
    setIsAddMenuOpen(false);
  }

  function removeField(fieldId: string) {
    const nextFields = fields.filter((field) => field.id !== fieldId);
    onFieldsChange(nextFields);

    if (selectedFieldId === fieldId && nextFields[0]) {
      onSelectField(nextFields[0].id);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex >= 0 && newIndex >= 0) {
      onFieldsChange(arrayMove(fields, oldIndex, newIndex));
    }
  }

  return (
    <section className="panel builder-panel" aria-labelledby="builder-heading">
      <div className="builder-header">
        <div>
          <h2 id="builder-heading">Fields</h2>
        </div>
        <div className="field-add-wrapper">
          <button
            type="button"
            className="add-field-button"
            onClick={() => setIsAddMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isAddMenuOpen}
            aria-label="Add field"
          >
            <Plus size={20} aria-hidden="true" />
          </button>
          {isAddMenuOpen ? (
            <div className="field-type-menu" role="menu" aria-label="Choose field type">
              {FIELD_TYPES.map((type) => (
                <button key={type} type="button" role="menuitem" onClick={() => addField(type)}>
                  <span>{type}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <p className="reorder-hint">
        <span>Drag to reorder fields</span>
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <ol className="field-list">
            {fields.map((field) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                selected={field.id === selectedFieldId}
                onSelect={() => onSelectField(field.id)}
                onRemove={() => removeField(field.id)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  );
}
