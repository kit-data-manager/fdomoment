import React from 'react';

interface FieldTemplateProps {
  id: string;
  classNames?: string;
  style?: any;
  disabled?: boolean;
  displayLabel?: boolean;
  hidden?: boolean;
  label?: React.ReactNode;
  onDropIndexClick?: (index: number) => void;
  onDropThisClick?: (event: React.MouseEvent) => void;
  readonly?: boolean;
  required?: boolean;
  schema?: any;
  uiSchema?: any;
  fields?: any;
  widgets?: any;
  formContext?: any;
  children: React.ReactNode;
  rawErrors?: string[];
  rawHelp?: React.ReactNode;
  rawDescription?: React.ReactNode;
}

export const FieldTemplate = ({
  id,
  classNames,
  hidden,
  children,
  displayLabel,
  label,
  required,
  schema,
}: FieldTemplateProps) => {
  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <div className={`form-control w-full ${classNames || ''}`}>
      {displayLabel && label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      {children}
      {schema?.description && (
        <div className="label">
          <span className="label-text-alt text-base-content/60">
            {schema.description}
          </span>
        </div>
      )}
    </div>
  );
};

interface ObjectFieldTemplateProps {
  TitleField?: React.ComponentType<any>;
  DescriptionField?: React.ComponentType<any>;
  properties: Array<{ content: React.ReactNode; name: string; required: boolean }>;
  uiSchema?: any;
  schema?: any;
  formContext?: any;
  idSchema?: any;
  disabled?: boolean;
  readonly?: boolean;
  onChange?: (value: any) => void;
  formData?: any;
}

export const ObjectFieldTemplate = ({
  TitleField,
  DescriptionField,
  properties,
  schema,
  uiSchema,
}: ObjectFieldTemplateProps) => {
  return (
    <div className="space-y-4">
      {TitleField && schema?.title && (
        <TitleField idSchema={{ $id: '' }} title={schema.title} />
      )}
      {DescriptionField && schema?.description && (
        <DescriptionField idSchema={{ $id: '' }} description={schema.description} />
      )}
      {properties.map((property: any, index: number) => (
        <div key={index} className="property-content">
          {property.content}
        </div>
      ))}
    </div>
  );
};

interface ArrayFieldTemplateProps {
  TitleField?: React.ComponentType<any>;
  DescriptionField?: React.ComponentType<any>;
  items: Array<{
    children: React.ReactNode;
    key: string;
    onDropIndexClick?: () => void;
    hasMoveUp: boolean;
    hasMoveDown: boolean;
    hasRemove: boolean;
    index: number;
    disabled?: boolean;
    readonly?: boolean;
    registry?: any;
    schema?: any;
    uiSchema?: any;
  }>;
  schema?: any;
  uiSchema?: any;
  formContext?: any;
  idSchema?: any;
  disabled?: boolean;
  readonly?: boolean;
  canAdd?: boolean;
  onAddClick?: () => void;
  formData?: any;
  registry?: any;
}

export const ArrayFieldTemplate = ({
  TitleField,
  DescriptionField,
  items,
  schema,
  canAdd,
  onAddClick,
  registry,
}: ArrayFieldTemplateProps) => {
  console.log('ArrayFieldTemplate - items length:', items?.length);
  console.log('ArrayFieldTemplate - items[0]:', items?.[0]);
  console.log('ArrayFieldTemplate - registry:', registry);
  
  return (
    <div className="space-y-4">
      {TitleField && schema?.title && (
        <TitleField idSchema={{ $id: '' }} title={schema.title} />
      )}
      {DescriptionField && schema?.description && (
        <DescriptionField idSchema={{ $id: '' }} description={schema.description} />
      )}
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <div key={item.key || index} className="border border-base-300 rounded p-4 relative bg-base-100">
            {item && item.children ? (
              item.children
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium text-base-content/70">Item {index + 1}</div>
                {!item.children && <div className="text-base-content/50 italic">Adding form fields...</div>}
              </div>
            )}
            {item.hasRemove && (
              <button
                type="button"
                className="btn btn-error btn-sm absolute top-2 right-2"
                onClick={item.onDropIndexClick}
              >
                Remove
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="text-base-content/50 italic">No items yet</div>
      )}
      {canAdd && onAddClick && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onAddClick}>
          Add Item
        </button>
      )}
    </div>
  );
};

export const ArrayFieldItemTemplate = ({
  children,
  disabled,
  hasMoveDown,
  hasMoveUp,
  hasRemove,
  itemIndex,
  onDropIndexClick,
  onMoveDownClick,
  onMoveUpClick,
  readonly,
  registry,
  schema,
  uiSchema,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  hasMoveDown?: boolean;
  hasMoveUp?: boolean;
  hasRemove?: boolean;
  itemIndex: number;
  onDropIndexClick?: () => void;
  onMoveDownClick?: () => void;
  onMoveUpClick?: () => void;
  readonly?: boolean;
  registry: any;
  schema?: any;
  uiSchema?: any;
}) => {
  console.log('ArrayFieldItemTemplate itemIndex:', itemIndex);
  console.log('ArrayFieldItemTemplate children:', children);
  console.log('ArrayFieldItemTemplate formContext:', registry.formContext);
  console.log('ArrayFieldItemTemplate field:', registry.fields);

  // Use the default RJSF FormField to render the item schema
  // The FormField is responsible for rendering based on the item's field schema
  
  if (children) {
    return <>{children}</>;
  }
  
  // Fallback: try to render using the default form field
  const { formContext, fields, formContext: fc } = registry;
  const { ArrayFieldItemTemplate: DefaultArrayFieldItemTemplate } = registry.templates;
  
  return <DefaultArrayFieldItemTemplate {...{ children, disabled, hasRemove, itemIndex, onDropIndexClick, readonly, schema }} />;
};

export const TitleField = ({ title, idSchema }: { title?: string; idSchema: any }) => {
  if (!title) return null;
  return (
    <h3 className="text-lg font-semibold" id={idSchema.$id}>
      {title}
    </h3>
  );
};

export const DescriptionField = ({ description, idSchema }: { description?: string; idSchema: any }) => {
  if (!description) return null;
  return (
    <p className="text-sm text-base-content/70" id={idSchema.$id}>
      {description}
    </p>
  );
};

export const ErrorList = ({ errors }: { errors: Array<{ message: string }> }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="alert alert-error mt-2">
      <div className="flex flex-col">
        {errors.map((error, index) => (
          <span key={index}>{error.message}</span>
        ))}
      </div>
    </div>
  );
};
