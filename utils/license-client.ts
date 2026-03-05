export type LicenseId = 
  | 'MIT'
  | 'Apache-2.0'
  | 'GPL-3.0'
  | 'LGPL-3.0'
  | 'BSD-3-Clause'
  | 'BSD-2-Clause'
  | 'ISC'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'Unlicense';

interface SPDXLicense {
  id: LicenseId;
  name: string;
  isOsiApproved: boolean;
  url: string;
}

// Function to get SPDX licenses with caching
export const getSPDXLicenses = async (): Promise<SPDXLicense[]> => {
    return [
        { id: 'MIT', name: 'MIT License', isOsiApproved: true, url: 'https://spdx.org/licenses/MIT.html' },
        { id: 'Apache-2.0', name: 'Apache License 2.0', isOsiApproved: true, url: 'https://spdx.org/licenses/Apache-2.0.html' },
        { id: 'GPL-3.0', name: 'GNU General Public License v3.0', isOsiApproved: true, url: 'https://spdx.org/licenses/GPL-3.0.html' },
        { id: 'LGPL-3.0', name: 'GNU Lesser General Public License v3.0', isOsiApproved: true, url: 'https://spdx.org/licenses/LGPL-3.0.html' },
        { id: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised" License', isOsiApproved: true, url: 'https://spdx.org/licenses/BSD-3-Clause.html' },
        { id: 'BSD-2-Clause', name: 'BSD 2-Clause "Simplified" License', isOsiApproved: true, url: 'https://spdx.org/licenses/BSD-2-Clause.html' },
        { id: 'ISC', name: 'ISC License', isOsiApproved: true, url: 'https://spdx.org/licenses/ISC.html' },
        { id: 'CC-BY-4.0', name: 'Creative Commons Attribution 4.0 International', isOsiApproved: false, url: 'https://spdx.org/licenses/CC-BY-4.0.html' },
        { id: 'CC-BY-SA-4.0', name: 'Creative Commons Attribution-ShareAlike 4.0 International', isOsiApproved: false, url: 'https://spdx.org/licenses/CC-BY-SA-4.0.html' },
        { id: 'Unlicense', name: 'The Unlicense', isOsiApproved: true, url: 'https://spdx.org/licenses/Unlicense.html' }
    ];
};

// Function to search SPDX licenses by query
export const searchSPDXLicenses = async (query: string): Promise<SPDXLicense[]> => {
  if (!query.trim()) {
    return [];
  }
  
  const allLicenses = await getSPDXLicenses();
  
  // Filter by query (case insensitive)
  return allLicenses.filter(item => 
    item.id.toLowerCase().includes(query.toLowerCase()) || 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
};
