import React, {useState} from 'react';
import {Icon} from '@iconify/react';
import {ChartCandlestick, KeyRound} from "lucide-react";

interface AdditionalSectionProps {
    onDataChange: (data: any) => void;
}

const AdditionalSection: React.FC<AdditionalSectionProps> = ({onDataChange}) => {
    const [rows, setRows] = useState<{ key: string, value: string }[]>([]);

    const handleComboboxChange = (index: number, value: string) => {
        const newRows = [...rows];
        newRows[index].key = value;
        setRows(newRows);
        onDataChange(newRows);
    };

    const handleInputChange = (index: number, value: string) => {
        const newRows = [...rows];
        newRows[index].value = value;
        setRows(newRows);
        onDataChange(newRows);
    };

    const addRow = () => {
        setRows([...rows, {key: '', value: ''}]);
    };

    const removeRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        onDataChange(newRows);
    };

    return (
        <div className="additional-section">
            {rows.map((row, index) => (
                <div key={index} className="row flex items-start gap-2 mb-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <KeyRound/>
                            <input
                                value={row.key}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                className="input input-bordered w-full"
                            />
                        </label>
                        <p className="label">The custom attribute key.</p>
                    </fieldset>
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <ChartCandlestick/>
                            <input
                                value={row.value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                className="input input-bordered w-full"
                            />
                        </label>
                        <p className="label">The custom attribute value.</p>
                    </fieldset>
                        <button
                            onClick={() => removeRow(index)}
                            className="btn btn-ghost mt-1 justify-self-end"
                        >
                            <Icon icon="mdi:delete" width="20" height="20"/>
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
    );
};

export default AdditionalSection;
