import React from 'react';
import { Icon } from "@iconify/react";
import { Tag, Trash2 } from "lucide-react";
import { TypedAttributesItem } from './types';

interface TypedPropertyItemComponentProps {
  property: TypedAttributesItem;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const TypedPropertyItemComponent = ({ property, index, onEdit, onRemove }: TypedPropertyItemComponentProps) => (
  <div className="row flex items-center gap-2 mb-2">
    <fieldset className="fieldset w-full">
      <label className="input w-full min-w-0">
        <Tag className="flex-shrink-0" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <span className="font-medium text-ellipsis">{property.typeName}</span>
          <span className="text-sm text-base-content/60 ml-2 text-ellipsis">({property.typeId})</span>
        </div>
      </label>
    </fieldset>
    <button
      onClick={() => onEdit(index)}
      className="btn btn-ghost btn-xs"
      title="Edit property"
    >
      <Icon icon="mdi:pencil" width="16" height="16" />
    </button>
    <button
      onClick={() => onRemove(index)}
      className="btn btn-ghost btn-xs"
      title="Remove property"
    >
      <Trash2 width="16" height="16" />
    </button>
  </div>
);

export default TypedPropertyItemComponent;
