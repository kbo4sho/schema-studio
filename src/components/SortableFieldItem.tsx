import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircleDot,
  GripVertical,
  Trash2,
  Type
} from "lucide-react";
import type { FieldSchema } from "../schema/types";

type SortableFieldItemProps = {
  field: FieldSchema;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

export function SortableFieldItem({
  field,
  selected,
  onSelect,
  onRemove
}: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`field-item ${selected ? "is-selected" : ""} ${isDragging ? "is-dragging" : ""}`}
      data-testid={`field-item-${field.name}`}
    >
      <button
        type="button"
        className="drag-handle"
        aria-label={`Drag ${field.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>
      <span className="field-type-icon" aria-hidden="true">
        <FieldTypeIcon field={field} />
      </span>
      <button type="button" className="field-summary" onClick={onSelect}>
        <span>{field.label}</span>
        <small>{field.type}</small>
      </button>
      <div className="field-actions" aria-label={`Field actions for ${field.label}`}>
        <button
          type="button"
          className="icon-button danger"
          onClick={onRemove}
          aria-label={`Remove ${field.label}`}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="field-chevron" onClick={onSelect} aria-label={`Inspect ${field.label}`}>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

function FieldTypeIcon({ field }: { field: FieldSchema }) {
  if (field.type === "textarea") {
    return <AlignLeft size={18} />;
  }

  if (field.type === "number") {
    return <span className="number-glyph">123</span>;
  }

  if (field.type === "select") {
    return <ChevronDown size={18} />;
  }

  if (field.type === "radio") {
    return <CircleDot size={18} />;
  }

  if (field.type === "checkbox") {
    return <CheckSquare size={18} />;
  }

  if (field.type === "date") {
    return <Calendar size={18} />;
  }

  return <Type size={18} />;
}
