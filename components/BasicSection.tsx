import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {Building2, TestTubeDiagonal, User, Users} from "lucide-react";
import RORAutocomplete from '@/components/RORAutocomplete';
import ORCiDAutocomplete from '@/components/ORCiDAutocomplete';

interface BasicSectionProps {
  onDataChange: (data: any) => void;
  onSave?: () => void;
}

const BasicSection = forwardRef<{ save: () => void }, BasicSectionProps>(({ onDataChange, onSave }, ref) => {
  const [inputs, setInputs] = useState({
    user_orcid: '',
    user_orcid_name: '',
    user_orcid_display: '',
    user_ror: '',
    user_ror_name: '',
    user_ror_display:'',
    research_field: ''
  });

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedUserOrcid = localStorage.getItem('user_orcid');
    const savedUserOrcidName = localStorage.getItem('user_orcid_name');
    const savedUserRor = localStorage.getItem('user_ror');
    const savedUserRorName = localStorage.getItem('user_ror_name');
    const savedResearchField = localStorage.getItem('research_field');
    
    // Set individual values
    if (savedUserOrcid) setInputs(prev => ({...prev, user_orcid: savedUserOrcid}));
    if (savedUserOrcidName) setInputs(prev => ({...prev, user_orcid_name: savedUserOrcidName}));
    if (savedUserRor) setInputs(prev => ({...prev, user_ror: savedUserRor}));
    if (savedUserRorName) setInputs(prev => ({...prev, user_ror_name: savedUserRorName}));
    if (savedResearchField) setInputs(prev => ({...prev, research_field: savedResearchField}));
    
    // Update display values to be in "name (id)" format for consistency with datalist
    if (savedUserOrcid && savedUserOrcidName) {
      setInputs(prev => ({
        ...prev,
        // Set display value to "name (id)" format
        user_orcid_display: `${savedUserOrcidName} (${savedUserOrcid})`
      }));
    }
    
    if (savedUserRor && savedUserRorName) {
      setInputs(prev => ({
        ...prev,
        // Set display value to "name (id)" format
        user_ror_display: `${savedUserRorName} (${savedUserRor})`
      }));
    }
  }, []);

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedInputs = localStorage.getItem('basicSectionInputs');
    if (savedInputs) {
      try {
        const parsedInputs = JSON.parse(savedInputs);
        
        // If we have combined values, split them into ID and name
        let updatedInputs = {...parsedInputs};
        
        // Split ORCID value if it contains both ID and name
        if (parsedInputs.user_orcid_display && parsedInputs.user_orcid_display.includes(' (')) {
          const parts = parsedInputs.user_orcid_display.split(' (');
          if (parts.length === 2) {
            const id = parts[1].replace(')', '').trim();
            const name = parts[0].trim();
            updatedInputs = {
              ...updatedInputs,
              user_orcid: id,
              user_orcid_name: name,
              user_orcid_display:`${name} (${id})`
            };
          }
        }
        
        // Split ROR value if it contains both ID and name
        if (parsedInputs.user_ror_display && parsedInputs.user_ror_display.includes(' (')) {
          const parts = parsedInputs.user_ror_display.split(' (');
          if (parts.length === 2) {
            const id = parts[1].replace(')', '').trim();
            const name = parts[0].trim();
            updatedInputs = {
              ...updatedInputs,
              user_ror: id,
              user_ror_name: name,
              user_ror_display:`${name} (${id})`
            };
          }
        }
        //setInputs(prev => ({...prev, ...updatedInputs}));
        onDataChange(updatedInputs);
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

  const save = () => {
    localStorage.setItem('user_orcid', inputs.user_orcid);
    localStorage.setItem('user_orcid_name', inputs.user_orcid_name);
    localStorage.setItem('user_ror', inputs.user_ror);
    localStorage.setItem('user_ror_name', inputs.user_ror_name);
    localStorage.setItem('research_field', inputs.research_field);
    onSave?.();
  }

  useImperativeHandle(ref, () => ({
    save
  }));

  return (
      <div className="card card-side bg-base-100 shadow-sm">
        <figure className="relative w-72 h-full">
          <img
              src="./basic_background.png"
              alt="Movie"
              className="opacity-10 logo border-r-2 border-secondary"/>
          <div
              className="absolute -top-15 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
              <span
                  className="text-sm">This modules contains basic kernel attributes to specify an FDO&apos;s ownership and context.</span>
            <br/>
            <span className="text-sm">These are {" "}
                  <Users width={12} height={12} className="inline align-baseline"/> ORCiD and {" "}
                  <Building2 width={12} height={12} className="inline align-baseline"/> affiliation ROR of
                  the creator as well as the <TestTubeDiagonal width={12} height={12}
                  className="inline align-baseline"/> research field the FAIR Digital Object is related to.</span>
          </div>
        </figure>
        <div className="card-body">
          <div className="flex items-center gap-2 z-60">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <User/>
                <ORCiDAutocomplete
                    value={inputs.user_orcid}
                    displayValue={inputs.user_orcid_display}
                    onChange={(value) => {
                      // Parse the value to extract name and ID if it's in format "name (id)"
                      if (value && value.includes(' (')) {
                        const parts = value.split(' (');
                        const name = parts[0];
                        const id = parts[1].replace(')', '');
                        setInputs(prev => ({
                          ...prev,
                          user_orcid: id,
                          user_orcid_name: name,
                          user_orcid_display: `${name} (${id})`
                        }));
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          user_orcid: value,
                          user_orcid_name: '',
                          user_orcid_display: value
                        }));
                      }
                    }}
                    onSelect={handleORCiDSelect}
                />
              </label>
              <p className="label">The associated users ORCiD.</p>
            </fieldset>
          </div>
          <div className="flex items-center gap-2 z-50">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <Building2/>
                <RORAutocomplete
                    value={inputs.user_ror}
                    displayValue={inputs.user_ror_display}
                    onChange={(value) => {
                        // Parse the value to extract name and ID if it's in format "name (id)"
                        if (value && value.includes(' (')) {
                            const parts = value.split(' (');
                            const name = parts[0];
                            const id = parts[1].replace(')', '');
                            setInputs(prev => ({
                                ...prev,
                                user_ror: id,
                                user_ror_name: name,
                                user_ror_display: `${name} (${id})`
                            }));
                        } else {
                            setInputs(prev => ({
                                ...prev,
                                user_ror: value,
                                user_ror_name: '',
                                user_ror_display: value
                            }));
                        }
                    }}
                    onSelect={handleRORSelect}
                />
              </label>
              <p className="label">The associated research organization identifier.</p>
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
            </fieldset>
          </div>
        </div>
      </div>
  );
});

BasicSection.displayName = 'BasicSection';

export default BasicSection;
