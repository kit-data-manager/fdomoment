import React from 'react';

interface WidgetProps {
  id: string;
  placeholder?: string;
  value: any;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  onBlur?: (id: string, value: any) => void;
  onFocus?: (id: string, value: any) => void;
  onChange: (value: any) => void;
  options: any;
  inputType?: string;
  type?: string;
  label?: React.ReactNode;
  schema: any;
  uiSchema?: any;
  [key: string]: any;
}

export const BaseInputTemplate = ({
  id,
  placeholder,
  value,
  disabled,
  readonly,
  autofocus,
  onBlur,
  onFocus,
  onChange,
  options,
  inputType = 'text',
  label,
  schema,
  ...props
}: WidgetProps) => {
  const inputProps = {
    maxLength: schema.maxLength,
    minLength: schema.minLength,
    pattern: schema.pattern,
    ...options,
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  };

  return (
    <input
      id={id}
      className="input input-bordered w-full"
      type={inputType}
      placeholder={placeholder}
      value={value ?? ''}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      onChange={handleChange}
      onBlur={onBlur && ((e: any) => onBlur(id, e.target.value))}
      onFocus={onFocus && ((e: any) => onFocus(id, e.target.value))}
      {...inputProps}
    />
  );
};

export const TextWidget = (props: WidgetProps) => {
  return <BaseInputTemplate {...props} inputType="text" />;
};

export const PasswordWidget = (props: WidgetProps) => {
  return <BaseInputTemplate {...props} inputType="password" />;
};

export const EmailWidget = (props: WidgetProps) => {
  return <BaseInputTemplate {...props} inputType="email" />;
};

export const URLWidget = (props: WidgetProps) => {
  return <BaseInputTemplate {...props} inputType="url" />;
};

export const TextareaWidget = ({
  id,
  placeholder,
  value,
  disabled,
  readonly,
  autofocus,
  onBlur,
  onFocus,
  onChange,
  options,
  label,
  schema,
  ...props
}: WidgetProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  };

  return (
    <textarea
      id={id}
      className="textarea textarea-bordered w-full h-24"
      placeholder={placeholder}
      value={value ?? ''}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      onChange={handleChange}
      onBlur={onBlur && ((e: any) => onBlur(id, e.target.value))}
      onFocus={onFocus && ((e: any) => onFocus(id, e.target.value))}
      {...options}
    />
  );
};

export const SelectWidget = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  options,
  label,
  schema,
  placeholder,
}: WidgetProps) => {
  const { enumOptions, enumDisabled } = options;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  };

  return (
    <select
      id={id}
      className="select select-bordered w-full"
      value={value ?? ''}
      disabled={disabled || readonly}
      onChange={handleChange}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {enumOptions?.map((option: { label: string; value: string }, index: number) => {
        const disabled = enumDisabled?.includes(option.value);
        return (
          <option key={index} value={option.value} disabled={disabled}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};

export const CheckboxWidget = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  options,
  label,
}: WidgetProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          id={id}
          className="checkbox checkbox-primary"
          checked={value}
          disabled={disabled || readonly}
          onChange={handleChange}
        />
        {label && <span className="label-text">{label}</span>}
      </label>
    </div>
  );
};

export const RadioWidget = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  options,
  label,
  schema,
}: WidgetProps) => {
  const { enumOptions } = options;
  const { inline } = options;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div className={`flex ${inline ? 'flex-row gap-4' : 'flex-col'}`}>
        {enumOptions?.map((option: { label: string; value: string }, index: number) => (
          <label key={index} className="label justify-start gap-2 cursor-pointer">
            <input
              type="radio"
              className="radio radio-primary"
              id={`${id}_${index}`}
              name={id}
              value={option.value}
              checked={value === option.value}
              disabled={disabled || readonly}
              onChange={() => onChange(option.value)}
            />
            <span className="label-text">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const CheckboxesWidget = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  options,
  label,
}: WidgetProps) => {
  const { enumOptions, enumDisabled } = options;
  const { inline } = options;

  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...(value || []), optionValue]);
    } else {
      onChange((value || []).filter((v: string) => v !== optionValue));
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div className={`flex ${inline ? 'flex-row gap-4' : 'flex-col'}`}>
        {enumOptions?.map((option: { label: string; value: string }, index: number) => {
          const checked = (value || []).includes(option.value);
          const disabled = enumDisabled?.includes(option.value);
          return (
            <label
              key={index}
              className="label justify-start gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                id={`${id}_${index}`}
                checked={checked}
                disabled={disabled || readonly}
                onChange={(e) => handleChange(option.value, e.target.checked)}
              />
              <span className="label-text">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export const RangeWidget = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  options,
  label,
  schema,
}: WidgetProps) => {
  const { min = 0, max = 100, step = 1 } = options;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
        <span className="label-text-alt">{value}</span>
      </label>
      <input
        type="range"
        className="range range-primary"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        disabled={disabled || readonly}
        onChange={handleChange}
      />
    </div>
  );
};

export const DateWidget = (props: WidgetProps) => {
  return <BaseInputTemplate {...props} inputType="date" />;
};

export const ColorWidget = (props: WidgetProps) => {
  return <BaseInputTemplate {...props} inputType="color" />;
};

export const HiddenWidget = ({ value, onChange }: { value: any; onChange: (value: any) => void }) => {
  return <input type="hidden" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
};

export const FileWidget = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  options,
  label,
  schema,
}: WidgetProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        type="file"
        className="file-input file-input-bordered w-full"
        id={id}
        disabled={disabled || readonly}
        onChange={handleChange}
      />
    </div>
  );
};
