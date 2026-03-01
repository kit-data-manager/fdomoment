import React, { useState, useEffect } from 'react';
import {Building2, TestTubeDiagonal, User, Users} from "lucide-react";
import RORAutocomplete from '@/components/RORAutocomplete';
import ORCiDAutocomplete from '@/components/ORCiDAutocomplete';

interface BasicSectionProps {
  onDataChange: (data: any) => void;
}

const BasicSection: React.FC<BasicSectionProps> = ({ onDataChange }) => {
  const [inputs, setInputs] = useState({
    user_orcid: '',
    user_orcid_name: '',
    user_ror: '',
    user_ror_name: '',
    research_field: ''
  });

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedUserOrcid = localStorage.getItem('user_orcid');
    const savedUserOrcidName = localStorage.getItem('user_orcid_name');
    const savedUserRor = localStorage.getItem('user_ror');
    const savedUserRorName = localStorage.getItem('user_ror_name');
    const savedResearchField = localStorage.getItem('research_field');
    
    if (savedUserOrcid) setInputs(prev => ({...prev, user_orcid: savedUserOrcid}));
    if (savedUserOrcidName) setInputs(prev => ({...prev, user_orcid_name: savedUserOrcidName}));
    if (savedUserRor) setInputs(prev => ({...prev, user_ror: savedUserRor}));
    if (savedUserRorName) setInputs(prev => ({...prev, user_ror_name: savedUserRorName}));
    if (savedResearchField) setInputs(prev => ({...prev, research_field: savedResearchField}));
  }, []);

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedInputs = localStorage.getItem('basicSectionInputs');
    if (savedInputs) {
      try {
        const parsedInputs = JSON.parse(savedInputs);
        setInputs(prev => ({...prev, ...parsedInputs}));
      } catch (error) {
        console.error('Error parsing saved inputs:', error);
      }
    }
  }, []);

  // Save inputs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('basicSectionInputs', JSON.stringify(inputs));
  }, [inputs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    setInputs(newInputs);
    onDataChange(newInputs);
  };

  const handleRORSelect = (id: string, name: string) => {
    // Update inputs with the selected ROR ID
    const newInputs = { ...inputs, user_ror: id, user_ror_name: name };
    setInputs(newInputs);
    onDataChange(newInputs);
  };

  const handleORCiDSelect = (id: string, name: string) => {
    // Update inputs with the selected ORCiD ID
    const newInputs = { ...inputs, user_orcid: id, user_orcid_name: name };
    setInputs(newInputs);
    onDataChange(newInputs);
  };

  return (
    <div className="basic-section grid grid-cols-1 gap-4">
      <div className="flex items-center gap-2 z-60">
        <fieldset className="fieldset w-full">
          <label className="input w-full ">
            <User/>
            <ORCiDAutocomplete
                value={inputs.user_orcid}
                displayValue={inputs.user_orcid_name}
                onChange={(value) => setInputs(prev => ({...prev, user_orcid: value, user_orcid_name: ''}))}
                onSelect={handleORCiDSelect}
            />
          </label>
          <p className="label">The associated users ORCiD.</p>
          <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                localStorage.setItem('user_orcid', inputs.user_orcid);
                localStorage.setItem('user_orcid_name', inputs.user_orcid_name);
              }}
          >
            Save
          </button>
        </fieldset>
      </div>
      <div className="flex items-center gap-2 z-50">
        <fieldset className="fieldset w-full">
          <label className="input w-full">
            <Building2/>
            <RORAutocomplete
                value={inputs.user_ror}
                displayValue={inputs.user_ror_name}
                onChange={(value) => setInputs(prev => ({...prev, user_ror: value, user_ror_name: ''}))}
                onSelect={handleRORSelect}
            />
          </label>
          <p className="label">The associated research organization identifier.</p>

          <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                localStorage.setItem('user_ror', inputs.user_ror);
                localStorage.setItem('user_ror_name', inputs.user_ror_name);
              }}
          >
            Save
          </button>
        </fieldset>
      </div>
      <div className="flex items-center gap-2">
        <fieldset className="fieldset w-full">
          <label className="input w-full">
            <TestTubeDiagonal/>
            <input
                name="research_field"
                value={inputs.research_field}
                onChange={handleChange}
                className="w-full"
                list="fields"
            />
            <datalist id="fields">
              <option value="Aeronautics, Space, Transport"></option>
              <option value="Earth&Environment"></option>
              <option value="Energy"></option>
              <option value="Health"></option>
              <option value="Information"></option>
              <option value="Matter"></option>
            </datalist>
          </label>
          <p className="label">The associated research field.</p>
          <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                localStorage.setItem('research_field', inputs.research_field);
              }}
          >
            Save
          </button>
        </fieldset>
      </div>
    </div>
  );
};

export default BasicSection;
