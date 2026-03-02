import React, {useState} from 'react';
import {Icon} from '@iconify/react';

interface AdditionalSectionProps {
    onDataChange: (data: any) => void;
}

const AdditionalSection: React.FC<AdditionalSectionProps> = ({onDataChange}) => {
    const [rows, setRows] = useState<{ combobox: string, inputField: string }[]>([]);

    const handleComboboxChange = (index: number, value: string) => {
        const newRows = [...rows];
        newRows[index].combobox = value;
        setRows(newRows);
        onDataChange(newRows);
    };

    const handleInputChange = (index: number, value: string) => {
        const newRows = [...rows];
        newRows[index].inputField = value;
        setRows(newRows);
        onDataChange(newRows);
    };

    const addRow = () => {
        setRows([...rows, {combobox: 'Option 1', inputField: ''}]);
    };

    const removeRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        onDataChange(newRows);
    };

    return (
        <div className="additional-section">
            {rows.map((row, index) => (
                <div key={index} className="row flex items-center gap-2 mb-2">
                    <select
                        value={row.combobox}
                        onChange={(e) => handleComboboxChange(index, e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="Option 1">Option 1</option>
                        <option value="Option 2">Option 2</option>
                    </select>
                    <input
                        value={row.inputField}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <button
                        onClick={() => removeRow(index)}
                        className="btn btn-ghost btn-sm"
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
