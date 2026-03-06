import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChartCandlestick, KeyRound } from "lucide-react";
import { Icon } from "@iconify/react";

interface AdditionalAttributesProps {
  onDataChange: (data: any) => void;
  onSave?: () => void;
}

const AdditionalAttributes = forwardRef<{ save: () => void }, AdditionalAttributesProps>(({ onDataChange, onSave }, ref) => {
  const [rows, setRows] = useState<{ key: string, value: string }[]>(JSON.parse(localStorage.getItem('additionalAttributesRows') ?? '[]'));

  const handleInputChange = (index: number, field: 'key' | 'value', value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
    onDataChange(newRows);
  };

  const addRow = () => {
    setRows([...rows, { key: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onDataChange(newRows);
  };

  const save = () => {
    localStorage.setItem('additionalAttributesRows', JSON.stringify(rows));
    onSave?.();
  }

  useImperativeHandle(ref, () => ({
    save
  }));

  return (
    <div className="card card-side bg-base-100 shadow-sm">
      <figure className="relative w-72 h-full">
        <img
          src="./additional_background.png"
          alt="AdditionalAttributesBackground"
          className="opacity-10 logo border-r-2 border-secondary"/>
        <div
          className="absolute -top-15 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
           <span className="text-sm">
                        This modules contributes additional, custom attributes to the FAIR Digital Object. These attributes are freely
                        choosable key-value-pairs that may be used to satisfy special use cases, for customization, or branding.
                        <br/><br/>
                        All attributes in this module can be locally persisted to reuse them across all
                        your FDOs.
           </span>
        </div>
      </figure>
      <div className="card-body">
        {rows.map((row, index) => (
          <div key={index} className="row flex items-start gap-2 mb-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <KeyRound />
                <input
                  value={row.key}
                  onChange={(e) => handleInputChange(index, 'key', e.target.value)}
                  className="w-full"
                  placeholder="Attribute key"
                />
              </label>
              <p className="label">The custom attribute&apos;s key.</p>
            </fieldset>
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <Icon icon="f7:textformat-abc" width={24} />
                <input
                  value={row.value}
                  onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                  className="w-full"
                  placeholder="Attribute value"
                />
              </label>
              <p className="label">The custom attribute&apos;s value.</p>
            </fieldset>
            <button
              onClick={() => removeRow(index)}
              className="btn btn-ghost mt-1 justify-self-end"
            >
              <Icon icon="mdi:delete" width="20" height="20" />
            </button>
          </div>
        ))}
        <button
          onClick={addRow}
          className="btn btn-soft btn-info btn-sm w-full"
        >
          Add Additional Property
        </button>
      </div>
    </div>
  );
});

AdditionalAttributes.displayName = 'AdditionalAttributes';

export default AdditionalAttributes;
