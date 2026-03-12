import React, { useState, useEffect } from "react";
import { Form } from "@rjsf/daisyui";
import validator from "@rjsf/validator-ajv8";


interface ValidatorArgument {
  key: string;
  value: string;
}

interface JsonValidatorFormProps {
  schema: any;
  formData: any;
  onChange: (data: any) => void;
}

const JsonValidatorForm = ({ schema, formData, onChange }: JsonValidatorFormProps) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!schema) return;
    
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const listItem = target.closest('li') as HTMLElement;
      if (listItem) {
        const dropdownContent = listItem.closest('.dropdown-content') as HTMLElement;
        if (dropdownContent) {
          const dropdown = dropdownContent.closest('.dropdown') as HTMLElement;
          if (dropdown) {
            dropdown.classList.add('dropdown-close');
            setTimeout(() => {
              dropdown.classList.remove('dropdown-close', 'dropdown-open');
            }, 200);
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [schema]);

  return (
    <div key={key} className="mt-4 rjsf-fix-selects">
      <style jsx global>{`
        .rjsf-fix-selects .dropdown-content.show {
          display: none !important;
        }
        .rjsf-fix-selects .dropdown-open .dropdown-content {
          display: none !important;
        }
      `}</style>
      <Form
        schema={schema}
        formData={formData}
        onSubmit={onChange}
        onChange={onChange}
        validator={validator}
        className="w-full"
        uiSchema={{ 'ui:autofocus': false }}
      >
        <div className="mt-4" />
      </Form>
    </div>
  );
};

export default JsonValidatorForm;
