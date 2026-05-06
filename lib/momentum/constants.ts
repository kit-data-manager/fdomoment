import {ResearchDomain} from "@/lib/momentum/types";

export const RESEARCH_DOMAINS: ResearchDomain[] = [
  { id: 'aeronautics_space_transport', label: 'Aeronautics, Space, and Transport'},
  { id: 'earth_and_environment', label: 'Earth & Environment'},
  { id: 'energy', label: 'Energy'},
  { id: 'health', label: 'Health'},
  { id: 'information', label: 'Information'},
  { id: 'matter', label: 'Matter'},
];

export const DATASET_LICENSES = [
  { id: 'cc0-1.0', label: 'CC0 1.0', url: 'https://spdx.org/licenses/CC0-1.0', recommended: true, hint: '✅ Use for maximum reuse and waiver of all rights.<br/>⛔ Not suitable when attribution or provenance tracking is required.' },
  { id: 'cc-by-4.0', label: 'CC BY 4.0', url: 'https://spdx.org/licenses/CC-BY-4.0', recommended: true, hint: '✅ Use for open data requiring attribution.<br/>⛔ Not suitable for databases with share-alike requirements.' },
  { id: 'cc-by-sa-4.0', label: 'CC BY-SA 4.0', url: 'https://spdx.org/licenses/CC-BY-SA-4.0', recommended: false, hint: '✅ Use when derivative works must be shared under the same license.<br/>⛔ Not suitable for proprietary or closed derivatives.' },
  { id: 'cc-by-nc-4.0', label: 'CC BY-NC 4.0', url: 'https://spdx.org/licenses/CC-BY-NC-4.0', recommended: false, hint: '✅ Use to restrict commercial use while allowing academic reuse.<br/>⛔ Not suitable for industry partnerships or commercial applications.' },
  { id: 'odc-by-1.0', label: 'ODC-By 1.0', url: 'https://spdx.org/licenses/ODC-By-1.0', recommended: false, hint: '✅ Use specifically for database contents requiring attribution.<br/>⛔ Not suitable for non-database creative works.' },
  { id: 'odbl-1.0', label: 'ODbL 1.0', url: 'https://spdx.org/licenses/ODbL-1.0', recommended: false, hint: '✅ Use for open databases requiring share-alike of derived databases.<br/>⛔ Not suitable when derived databases should remain proprietary.' },
];

export const SOFTWARE_LICENSES = [
  { id: 'mit', label: 'MIT', url: 'https://spdx.org/licenses/MIT', hint: '✅ Use for simple permissive licensing with minimal restrictions.<br/>⛔ Not suitable when patent protection or copyleft is needed.' },
  { id: 'apache-2.0', label: 'Apache 2.0', url: 'https://spdx.org/licenses/Apache-2.0', hint: '✅ Use for projects needing explicit patent grants and permissive terms.<br/>⛔ Not suitable when strong copyleft enforcement is required.' },
  { id: 'gpl-3.0-only', label: 'GPL-3.0 only', url: 'https://spdx.org/licenses/GPL-3.0-only', hint: '✅ Use to ensure all derivative works remain open source.<br/>⛔ Not suitable for linking with proprietary software.' },
  { id: 'bsd-3-clause', label: 'BSD-3-Clause', url: 'https://spdx.org/licenses/BSD-3-Clause', hint: '✅ Use for permissive licensing with endorsement protection.<br/>⛔ Not suitable when copyleft or patent clauses are needed.' },
  { id: 'lgpl-2.1-only', label: 'LGPL-2.1 only', url: 'https://spdx.org/licenses/LGPL-2.1-only', hint: '✅ Use for libraries allowing linking with proprietary code.<br/>⛔ Not suitable when the entire application must be open source.' },
  { id: 'eupl-1.2', label: 'EUPL-1.2', url: 'https://spdx.org/licenses/EUPL-1.2', hint: '✅ Use for EU public sector projects requiring copyleft under EU law.<br/>⛔ Not suitable for non-EU jurisdictions or permissive licensing needs.' },
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
  'earth_and_environment': 'cc-by-4.0',
  'health': 'cc-by-4.0',
  'information': 'mit',
  'matter': 'cc-by-4.0',
};

export const DOMAIN_COMMON_MIME_TYPES: Record<string, string[]> = {
  'earth_and_environment': ['application/x-netcdf', 'text/csv', 'application/json'],
  'health': ['text/csv', 'application/xml', 'image/tiff'],
  'information': ['application/json', 'text/plain', 'application/xml'],
  'matter': ['application/x-netcdf', 'text/csv', 'application/pdf'],
  'energy': ['application/json', 'application/xml', 'application/pdf'],
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
  { id: 'posted-content', label: 'Blog Post' },

];

export const SUGGESTED_CUSTOM_KEYS = [
  'funding',
  'funder',
  'version',
  'language',
  'subject',
  'temporal_coverage',
  'spatial_coverage',
  'project',
  'grant_number',
  'URL'
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

export function getLicenseById(licenseId:string):string{
    const license = DATASET_LICENSES.find(l => l.id === licenseId);
    if (license) {
        return license.url;
    }
    return ''
}

export function getCommonMimeTypes(researchDomain: ResearchDomain | null) {
  if (!researchDomain) return [];
  const mimeIds = DOMAIN_COMMON_MIME_TYPES[researchDomain.id] || [];
  return mimeIds
    .map(id => MIME_TYPES.find(m => m.id === id))
    .filter((m): m is { id: string; label: string; category: string } => m !== undefined);
}

export function getSuggestedKeys(researchDomain: ResearchDomain | null): string[] {
  const baseKeys = SUGGESTED_CUSTOM_KEYS;
  
  const domainSpecificKeys: Record<string, string[]> = {
    'earth_and_environment': ['temporal_coverage', 'spatial_coverage', 'variable'],
    'information': ['species', 'habitat', 'temporal_coverage'],
    'health': ['patient_group', 'temporal_coverage', 'funding'],
    'matter': ['compound', 'method', 'instrument'],
  };
  
  if (researchDomain && domainSpecificKeys[researchDomain.id]) {
    return [...domainSpecificKeys[researchDomain.id], ...baseKeys];
  }
  
  return baseKeys;
}
