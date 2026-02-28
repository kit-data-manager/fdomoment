import React, { useState } from 'react';

interface DatasetSectionProps {
  onDataChange: (data: any) => void;
}

const DatasetSection: React.FC<DatasetSectionProps> = ({ onDataChange }) => {
  const [mimeType, setMimeType] = useState('text/plain');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMimeType(value);
    onDataChange({ mimeType: value });
  };

  return (
    <div className="dataset-section flex items-center gap-2">
      <label className="w-24">Mime Type:</label>
      <select 
        value={mimeType} 
        onChange={handleChange} 
        className="select select-bordered w-full"
      >
        <option value="text/plain">Text</option>
        <option value="image/jpeg">JPEG Image</option>
        <option value="application/json">JSON</option>
      </select>
    </div>
  );
};

export default DatasetSection;