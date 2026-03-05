import { LicenseId } from './license-client';

export type RepositoryType =
    | 'GitHub'
    | 'GitLab.com'
    | "Codebase@Helmholtz"
    | "GitLab@KIT"
    | "Other";

interface RepositoryInfo {
  repositoryType?: RepositoryType;
  license?: LicenseId;
  readmeUrl?: string;
}

/**
 * Fetches information about a public repository (GitHub or GitLab)
 * @param repoUrl - The URL of the public repository (e.g., https://github.com/username/repo or https://gitlab.com/username/repo)
 * @returns Promise with repository information including license and README URL
 */
export async function getRepositoryInfo(repoUrl: string): Promise<RepositoryInfo> {
    // Parse the repository URL to extract owner and repo name
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid repository URL format');
    }
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    
    // Determine if it's GitHub or GitLab
    let isGitHub = false;
    let isGitLab = false;
    let gitlabName:RepositoryType = "GitLab.com";


    let apiBase:string = 'https://api.github.com/repos';
    let repoBase:string = 'https://github.com';

    if (url.hostname === 'github.com') {
      isGitHub = true;
    } else if (url.hostname === 'gitlab.com') {
        isGitLab = true;
        apiBase = 'https://gitlab.com/api/v4';
        repoBase = 'https://gitlab.com';
    } else  if (url.hostname === 'gitlab.kit.edu') {
        isGitLab = true;
        gitlabName = "GitLab@KIT";
        apiBase = 'https://gitlab.kit.edu/api/v4';
        repoBase = 'https://gitlab.kit.edu';
    } else  if (url.hostname === 'codebase.helmholtz.cloud') {
        isGitLab = true;
        gitlabName = "Codebase@Helmholtz";
        apiBase = 'https://codebase.helmholtz.cloud/api/v4';
        repoBase = 'https://codebase.helmholtz.cloud';
    }else{
      throw new Error('Unsupported repository host: ' + url.hostname);
    }
    
    if (isGitHub) {
      // Fetch repository information to get default branch
      const repoResponse = await fetch(`${apiBase}/${owner}/${repo}`);
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repository info: ${repoResponse.status}`);
      }

      // Try to fetch LICENSE file
      let licenseId: LicenseId | undefined = undefined;
      const licenseResponse = await fetch(`${apiBase}/${owner}/${repo}/contents/LICENSE`);
      if (licenseResponse.ok) {
        const licenseData = await licenseResponse.json();
        const licenseContent = atob(licenseData.content);

        // Try to map license content to known license IDs
        licenseId = mapLicenseToId(licenseContent);
      }
      
      // Get README.md URL
      let readmeUrl: string | undefined = undefined;
      const readmeResponse = await fetch(`${apiBase}/${owner}/${repo}/contents/README.md`);
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        readmeUrl = readmeData.html_url;
      }

      return {
        repositoryType: "GitHub",
        license: licenseId,
        readmeUrl: readmeUrl
      };
    }

    // GitLab API base URL
    if (isGitLab) {

      // Get repository ID (GitLab doesn't directly expose the ID from the URL, so we need to search)
      const searchResponse = await fetch(`${apiBase}/projects?query=${encodeURIComponent(owner + '/' + repo)}`, {
          headers: {
              "PRIVATE_TOKEN": ""
          }
      });
      if (!searchResponse.ok) {
        throw new Error(`Failed to search for repository: ${searchResponse.status}`);
      }
      
      const searchResults = await searchResponse.json();
      if (searchResults.length === 0) {
        throw new Error('Repository not found');
      }
      
      const projectId = searchResults[0].id;
      
      // Try to fetch LICENSE file
      let licenseId: LicenseId | undefined = undefined;
      const licenseResponse = await fetch(`${apiBase}/projects/${projectId}/repository/files/LICENSE?ref=main`);
      if (licenseResponse.ok) {
        const licenseData = await licenseResponse.json();
        const licenseContent = atob(licenseData.content);
        
        // Try to map license content to known license IDs
        licenseId = mapLicenseToId(licenseContent);
      }
      
      // Get README.md URL
      let readmeUrl: string | undefined = undefined;
      const readmeResponse = await fetch(`${apiBase}/projects/${projectId}/repository/files/README.md?ref=main`);
      if (readmeResponse.ok) {
        // GitLab doesn't provide a direct HTML URL, so we construct it
        readmeUrl = `${repoBase}/${owner}/${repo}/-/blob/main/README.md`;
      }
      
      return {
        repositoryType: gitlabName,
        license: licenseId,
        readmeUrl: readmeUrl
      };
    }

  return {};
}

/**
 * Maps license content to a known license ID
 * @param licenseContent - The content of the LICENSE file
 * @returns The corresponding license ID or undefined if not found
 */
function mapLicenseToId(licenseContent: string): LicenseId | undefined {
  // Check for common licenses by looking for specific keywords
  if (licenseContent.includes('MIT License') || licenseContent.includes('MIT')) {
    return 'MIT';
  } else if (licenseContent.includes('Apache License') || licenseContent.includes('Apache')) {
    return 'Apache-2.0';
  } else if (licenseContent.includes('GNU General Public License') || licenseContent.includes('GPL')) {
    return 'GPL-3.0';
  } else if (licenseContent.includes('GNU Lesser General Public License') || licenseContent.includes('GPL')) {
      return 'LGPL-3.0';
  }else if (licenseContent.includes('ISC License') || licenseContent.includes('ISC')) {
      return 'ISC';
  }else if (licenseContent.includes('Redistributions of source code') && licenseContent.includes('Redistributions in binary form') && licenseContent.includes('Neither the name of the copyright holder')) {
    return 'BSD-3-Clause';
  }else if (licenseContent.includes('Redistributions of source code') && licenseContent.includes('Redistributions in binary form')) {
    return 'BSD-2-Clause';
  } else if (licenseContent.includes('Creative Commons Attribution 4.0 International')) {
    return 'CC-BY-4.0';
  } else if (licenseContent.includes('Creative Commons Attribution-ShareAlike 4.0 International')) {
    return 'CC-BY-SA-4.0';
  }else if (licenseContent.includes('This is free and unencumbered')) {
    return 'Unlicense';
  }

  // If no specific or known license is found, return undefined
  return undefined;
}
