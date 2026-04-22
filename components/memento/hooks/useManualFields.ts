import { useState, useEffect } from 'react';
import type { FdoRecord } from '@/lib/database/types';

interface FullFdoRecord extends FdoRecord {
  record: Record<string, string | string[]>;
}

interface UseManualFieldsProps {
  fullFdo: FullFdoRecord | null;
}

export function useManualFields({ fullFdo }: UseManualFieldsProps) {
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDoi, setManualDoi] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualVersion, setManualVersion] = useState('');

  useEffect(() => {
    if (!fullFdo) return;
console.log(fullFdo);
    const record = fullFdo.record;
    
    const extractFirst = (value: string | string[]): string => {
      return Array.isArray(value) ? value[0] : value;
    };

    const populateManualFields = async () => {
      setManualTitle(extractFirst(record['0.SIMPLE/PUBLICATION_TITLE'] || ''));
      setManualDoi(extractFirst(record['0.SIMPLE/DOI'] || ''));
      setManualUrl(extractFirst(record['0.SIMPLE/DATA_OBJECT_LOCATION'] || record['0.SIMPLE/SOFTWARE_LOCATION'] || record['URL'] || ''));
      setManualVersion(extractFirst(record['0.SIMPLE/VERSION'] || record['version'] || ''));
      
      const orcidValue = record['0.SIMPLE/PUBLICATION_CREATOR'];
      if (orcidValue) {
        const orcidList = Array.isArray(orcidValue) ? orcidValue : [orcidValue];
        
        const authorNames: string[] = [];
        for (const orcid of orcidList) {
          if (orcid) {
            try {
              const response = await fetch(
                `https://pub.orcid.org/v3.0/${orcid.replace(/\s/g, '')}/person`,
                {
                  headers: {
                    "Accept": "application/vnd.orcid+json",
                  }
                }
              );
              
              if (!response.ok) {
                authorNames.push(orcid);
                continue;
              }
              
              const person = await response.json();
              const givenNames = person['name']['given-names']?.['value'] || '';
              const familyNames = person['name']['family-name']?.['value'] || '';
              const name = `${givenNames} ${familyNames}`.trim();
              
              if (name) {
                const parts = name.split(' ');
                if (parts.length > 1) {
                  const last = parts[parts.length - 1];
                  const firstInitial = parts[0].charAt(0).toUpperCase() + '.';
                  authorNames.push(`${last}, ${firstInitial}`);
                } else {
                  authorNames.push(name);
                }
              } else {
                authorNames.push(orcid);
              }
            } catch (error) {
              console.error('Failed to fetch ORCID:', error);
              authorNames.push(orcid);
            }
          }
        }
        
        if (authorNames.length > 0) {
          setManualAuthor(authorNames.join(', '));
        }
      }
    };
    populateManualFields();
  }, [fullFdo]);

  return { manualAuthor, manualTitle, manualDoi, manualUrl, manualVersion, setManualAuthor, setManualTitle, setManualDoi, setManualUrl, setManualVersion };
}
