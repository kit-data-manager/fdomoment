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
                        This modules contributes additional, custom attributes to the FAIR Digital Object. A digital object can be
                        for example a dataset, a single file, but also a (metadata) document, schema, and even a stream. The contained
                        attributes are mainly used to facilitate <span className="text-info">accessibility</span>.
                        <br/><br/>
                        <span className="text-info">Digital Object Module</span> and <span className="text-info">Software Module</span> are <span className="text-info">exclusive</span> {" "}
               and can not be used together.
                        <br/><br/>
                        For documents, primarily consumed by humans, i.e., articles, instructions, or protocols, the {" "}
               <span className="text-info">Document Module</span> can be added for extended {" "}
               <span className="text-info">findability</span>.
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
                  className="input input-bordered w-full"
                  placeholder="Attribute key"
                />
              </label>
              <p className="label">The custom attribute key.</p>
            </fieldset>
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <Icon icon="f7:textformat-abc" width={24} />
                <input
                  value={row.value}
                  onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Attribute value"
                />
              </label>
              <p className="label">The custom attribute value.</p>
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
