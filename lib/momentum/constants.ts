import {ResearchDomain} from "@/lib/momentum/types";

export const RESEARCH_DOMAINS: ResearchDomain[] = [
  { id: 'biology', label: 'Biology', category: 'Natural Sciences' },
  { id: 'chemistry', label: 'Chemistry', category: 'Natural Sciences' },
  { id: 'physics', label: 'Physics', category: 'Natural Sciences' },
  { id: 'geosciences', label: 'Geo Sciences', category: 'Natural Sciences' },
  { id: 'climatology', label: 'Climatology', category: 'Natural Sciences' },
  { id: 'astronomy', label: 'Astronomy', category: 'Natural Sciences' },
  { id: 'mathematics', label: 'Mathematics', category: 'Natural Sciences' },
  { id: 'computer-science', label: 'Computer Science', category: 'Natural Sciences' },
  { id: 'mechanical-engineering', label: 'Mechanical Engineering', category: 'Engineering' },
  { id: 'electrical-engineering', label: 'Electrical Engineering', category: 'Engineering' },
  { id: 'medicine', label: 'Medicine', category: 'Live Sciences' },
  { id: 'pharmacy', label: 'Pharmacy', category: 'Live Sciences' },
  { id: 'psychology', label: 'Psychology', category: 'Live Sciences' },
  { id: 'sociology', label: 'Sociology', category: 'Arts and Humanities' },
  { id: 'history', label: 'History', category: 'Arts and Humanities' },
];

export const DATASET_LICENSES = [
  { id: 'cc0-1.0', label: 'CC0 1.0', url: 'https://spdx.org/licenses/CC0-1.0', recommended: true },
  { id: 'cc-by-4.0', label: 'CC BY 4.0', url: 'https://spdx.org/licenses/CC-BY-4.0', recommended: true },
  { id: 'cc-by-sa-4.0', label: 'CC BY-SA 4.0', url: 'https://spdx.org/licenses/CC-BY-SA-4.0', recommended: false },
  { id: 'cc-by-nc-4.0', label: 'CC BY-NC 4.0', url: 'https://spdx.org/licenses/CC-BY-NC-4.0', recommended: false },
  { id: 'odc-by-1.0', label: 'ODC-By 1.0', url: 'https://spdx.org/licenses/ODC-By-1.0', recommended: false },
  { id: 'odbl-1.0', label: 'ODbL 1.0', url: 'https://spdx.org/licenses/ODbL-1.0', recommended: false },
];

export const SOFTWARE_LICENSES = [
  { id: 'mit', label: 'MIT', url: 'https://spdx.org/licenses/MIT' },
  { id: 'apache-2.0', label: 'Apache 2.0', url: 'https://spdx.org/licenses/Apache-2.0' },
  { id: 'gpl-3.0-only', label: 'GPL-3.0 only', url: 'https://spdx.org/licenses/GPL-3.0-only' },
  { id: 'bsd-3-clause', label: 'BSD-3-Clause', url: 'https://spdx.org/licenses/BSD-3-Clause' },
  { id: 'lgpl-2.1-only', label: 'LGPL-2.1 only', url: 'https://spdx.org/licenses/LGPL-2.1-only' },
  { id: 'eupl-1.2', label: 'EUPL-1.2', url: 'https://spdx.org/licenses/EUPL-1.2' },
];

export const MIME_TYPES = [
  { id: 'text/csv', label: 'text/csv', category: 'text' },
  { id: 'text/plain', label: 'text/plain', category: 'text' },
  { id: 'text/html', label: 'text/html' , category: 'text' },
  { id: 'text/xml', label: 'text/xml', category: 'text' },
  { id: 'application/json', label: 'application/json', category: 'application' },
  { id: 'application/xml', label: 'application/xml', category: 'application' },
  { id: 'application/pdf', label: 'application/pdf', category: 'application' },
  { id: 'application/zip', label: 'application/zip', category: 'application' },
  { id: 'application/x-netcdf', label: 'application/x-netcdf', category: 'application' },
  { id: 'image/tiff', label: 'image/tiff', category: 'image' },
  { id: 'image/png', label: 'image/png', category: 'image' },
  { id: 'image/jpeg', label: 'image/jpeg', category: 'image' },
  { id: 'audio/mpeg', label: 'audio/mpeg', description: 'media' },
  { id: 'video/mp4',label: 'video/mp4', description: 'media' }
];

export const DOMAIN_DEFAULT_LICENSE: Record<string, string> = {
  'climatology': 'cc-by-4.0',
  'biology': 'cc0-1.0',
  'computer-science': 'mit',
  'physics': 'cc-by-4.0',
};

export const DOMAIN_COMMON_MIME_TYPES: Record<string, string[]> = {
  'climatology': ['application/x-netcdf', 'text/csv', 'application/json'],
  'biology': ['text/csv', 'application/xml', 'image/tiff'],
  'computer-science': ['application/json', 'text/plain', 'application/xml'],
  'physics': ['application/x-netcdf', 'text/csv', 'application/pdf'],
  'chemistry': ['text/csv', 'application/xml', 'application/pdf'],
};

export const PUBLICATION_TYPES = [
  { id: 'journal-article', label: 'Journal Article' },
  { id: 'conference-paper', label: 'Conference Paper' },
  { id: 'book', label: 'Book' },
  { id: 'book-chapter', label: 'Book Chapter' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'software', label: 'Software' },
  { id: 'preprint', label: 'Preprint' },
  { id: 'report', label: 'Report' },
  { id: 'thesis', label: 'Thesis' },
];

export const SUGGESTED_MISC_KEYS = [
  'funding',
  'funder',
  'version',
  'language',
  'subject',
  'temporal_coverage',
  'spatial_coverage',
  'project',
  'grant_number',
];

export const KNOWN_REPOSITORIES = [
  { pattern: /zenodo\.org/, name: 'Zenodo' },
  { pattern: /dryad\.org/, name: 'Dryad' },
  { pattern: /figshare\.com/, name: 'figshare' },
  { pattern: /pangaea\.de/, name: 'PANGAEA' },
  { pattern: /osf\.io/, name: 'OSF' },
];

export function getLicenseHint(researchDomain: ResearchDomain | null) {
  if (!researchDomain) return [];

  const defaultLicense = DOMAIN_DEFAULT_LICENSE[researchDomain.id];
  if (defaultLicense) {
    const license = DATASET_LICENSES.find(l => l.id === defaultLicense);
    if (license) {
      return [{id: license.id, label:license.label}];//`Recommended for ${researchDomain.label}`;
    }
  }
  return [];
}

export function getCommonMimeTypes(researchDomain: ResearchDomain | null) {
  if (!researchDomain) return [];
  const mimeIds = DOMAIN_COMMON_MIME_TYPES[researchDomain.id] || [];
  return mimeIds
    .map(id => MIME_TYPES.find(m => m.id === id))
    .filter((m): m is { id: string; label: string; category: string } => m !== undefined);
}

export function getSuggestedKeys(researchDomain: ResearchDomain | null): string[] {
  const baseKeys = SUGGESTED_MISC_KEYS;
  
  const domainSpecificKeys: Record<string, string[]> = {
    'climatology': ['temporal_coverage', 'spatial_coverage', 'variable'],
    'biology': ['species', 'habitat', 'temporal_coverage'],
    'medicine': ['patient_group', 'temporal_coverage', 'funding'],
    'chemistry': ['compound', 'method', 'instrument'],
  };
  
  if (researchDomain && domainSpecificKeys[researchDomain.id]) {
    return [...domainSpecificKeys[researchDomain.id], ...baseKeys];
  }
  
  return baseKeys;
}
