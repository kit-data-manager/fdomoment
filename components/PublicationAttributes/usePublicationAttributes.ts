import { useState } from 'react';
import { PublicationAttributesModuleData, Creator } from './types';

export const usePublicationAttributes = () => {
  const getInitialState = (): PublicationAttributesModuleData => ({
    doi: '',
    publicationType: '',
    title: '',
    publicationYear: '',
    creators: []
  });

  const [inputs, setInputs] = useState<PublicationAttributesModuleData>(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    
    const publicationInput = localStorage.getItem('publicationAttributes');
    if (publicationInput) {
      try {
        const parsed = JSON.parse(publicationInput);
        return {
          ...parsed,
          creators: parsed.creators || []
        };
      } catch (e) {
        console.error('Error parsing publication attributes from localStorage:', e);
      }
    }
  
    return getInitialState();
  });

  const updateInputs = (newInputs: PublicationAttributesModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('publicationAttributes', JSON.stringify(newInputs));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    updateInputs(newInputs);
  };

  const handleAddCreator = () => {
    const newInputs = {
      ...inputs,
      creators: [...inputs.creators, { id: '', name: '', orcid: '' }]
    };
    updateInputs(newInputs);
  };

  const handleRemoveCreator = (index: number) => {
    const newCreators = inputs.creators.filter((_, i) => i !== index);
    const newInputs = { ...inputs, creators: newCreators };
    updateInputs(newInputs);
  };

  const handleCreatorChange = (index: number, field: keyof Creator, value: string) => {
    const newCreators = inputs.creators.map((creator, i) => 
      i === index ? { ...creator, [field]: value } : creator
    );
    const newInputs = { ...inputs, creators: newCreators };
    updateInputs(newInputs);
  };

  const handleCreatorSelect = (index: number, id: string, name: string) => {
    const newCreators = inputs.creators.map((creator, i) =>
      i === index ? { ...creator, id, name } : creator
    );
    const newInputs = { ...inputs, creators: newCreators };
    updateInputs(newInputs);
  };

  const handleSetCreatorsFromMetadata = (metadataCreators: Array<{ givenName?: string; familyName?: string; orcid?: string }>) => {
    const creators: Creator[] = metadataCreators.map(creator => {
      const givenName = creator.givenName || '';
      const familyName = creator.familyName || '';
      const name = `${familyName}, ${givenName}`.trim();
      const orcid = creator.orcid || '';
      const id = orcid ? `https://orcid.org/${orcid}` : '';
      
      return {
        id,
        name,
        orcid
      };
    });

    const newInputs = { ...inputs, creators };
    updateInputs(newInputs);
  };

  return {
    inputs,
    handleInputChange,
    handleAddCreator,
    handleRemoveCreator,
    handleCreatorChange,
    handleCreatorSelect,
    handleSetCreatorsFromMetadata,
    updateInputs,
    setInputs
  };
};
