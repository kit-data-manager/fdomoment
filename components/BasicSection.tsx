import React, { useState } from 'react';

interface BasicSectionProps {
  onDataChange: (data: any) => void;
}

const BasicSection: React.FC<BasicSectionProps> = ({ onDataChange }) => {
  const [inputs, setInputs] = useState({
    input1: '',
    input2: '',
    input3: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    setInputs(newInputs);
    onDataChange(newInputs);
  };

  return (
    <div className="basic-section grid grid-cols-1 gap-4">
      <div className="flex items-center gap-2">
        <label className="w-24">Input 1:</label>
        <input 
          name="input1" 
          value={inputs.input1} 
          onChange={handleChange} 
          className="input input-bordered w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-24">Input 2:</label>
        <input 
          name="input2" 
          value={inputs.input2} 
          onChange={handleChange} 
          className="input input-bordered w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-24">Input 3:</label>
        <input 
          name="input3" 
          value={inputs.input3} 
          onChange={handleChange} 
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
};

export default BasicSection;
