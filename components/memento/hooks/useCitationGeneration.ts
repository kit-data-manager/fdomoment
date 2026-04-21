import { useState, useEffect, useCallback } from 'react';
import type { FdoRecord } from '@/lib/database/types';

interface FullFdoRecord extends FdoRecord {
  record: Record<string, string | string[]>;
}

interface UseCitationGenerationProps {
  fullFdo: FullFdoRecord | null;
  citationStyle: 'apa' | 'ieee' | 'harvard' | 'bibtex';
  manualAuthor: string;
  manualTitle: string;
  manualDoi: string;
  manualUrl: string;
  manualVersion: string;
  fdoPid: string;
}

export function useCitationGeneration({ 
  fullFdo, 
  citationStyle, 
  manualAuthor, 
  manualTitle, 
  manualDoi, 
  manualUrl, 
  manualVersion,
  fdoPid 
}: UseCitationGenerationProps) {
  const [citationText, setCitationText] = useState('');

  const generateCitation = useCallback(async () => {
    if (!fullFdo) {
      setCitationText('');
      return;
    }

    const record = fullFdo.record;

    const getAuthor = async (): Promise<string> => {
      if (manualAuthor) return manualAuthor;
      const orcidValue = record['0.SIMPLE/PUBLICATION_CREATOR'];
      
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
      
      return authorNames.join(', ');
    };

    const getTitle = () => manualTitle;
    const getDoi = () => manualDoi;
    const getUrl = () => manualUrl;
    const getVersion = () => manualVersion;
    const getYear = () => {
      const dateValue = record['0.SIMPLE/PUBLICATION_DATE'] || record['0.SIMPLE/CREATION_DATE'] || '';
      const dateStr = Array.isArray(dateValue) ? dateValue[0] : dateValue;
      return dateStr ? new Date(dateStr).getFullYear().toString() : '';
    };

    const author = await getAuthor();
    const title = getTitle();
    const doi = getDoi();
    const url = getUrl();
    const version = getVersion();
    const year = getYear();
    const authors = author ? [author] : [];

    if (citationStyle === 'bibtex') {
      let citeType = 'misc';
      if (record['0.SIMPLE/DATA_OBJECT_LOCATION']) {
        citeType = 'dataset';
      } else if (record['0.SIMPLE/SOFTWARE_LOCATION']) {
        citeType = 'software';
      }

      let bibtex = `@${citeType}{${fdoPid.split('/').pop() || 'fdo'},\n`;
      if (author) bibtex += `  author = {${author}},\n`;
      if (title) bibtex += `  title = {${title}},\n`;
      if (year) bibtex += `  year = {${year}},\n`;
      if (doi) bibtex += `  doi = {${doi}},\n`;
      if (url) bibtex += `  url = {${url}},\n`;
      if (version) bibtex += `  version = {${version}},\n`;
      bibtex += '}';
      setCitationText(bibtex);
    } else {
      let citation = '';
      const yearStr = year ? `(${year})` : '';
      const titlePart = title ? `${title}.` : '';
      const doiPart = doi ? `https://doi.org/${doi}` : url;
      const authorsStr = authors.length > 0 ? authors.join(', ') : '';

      if (citationStyle === 'apa') {
        citation = `${authorsStr} ${yearStr} ${titlePart} ${doiPart || url}`;
      } else if (citationStyle === 'ieee') {
        citation = `[1] ${authorsStr} "${titlePart}" ${yearStr}. ${doiPart || url}`;
      } else if (citationStyle === 'harvard') {
        citation = `${authorsStr} ${yearStr} ${titlePart} Available at: ${doiPart || url}`;
      }

      setCitationText(citation.trim());
    }
  }, [fullFdo, citationStyle, manualAuthor, manualTitle, manualDoi, manualUrl, manualVersion, fdoPid]);

  useEffect(() => {
    generateCitation();
  }, [generateCitation]);

  return { citationText };
}
