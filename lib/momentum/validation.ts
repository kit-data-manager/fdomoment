import {
  CoreMetadata,
  DataObjectMetadata,
  SoftwareMetadata,
  PublicationMetadata,
  MiscMetadata,
  ModuleStatus
} from './types';
import {KNOWN_REPOSITORIES} from "@/lib/momentum/constants";

export function validateOrcidFormat(orcid: string): boolean {
  const regex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  if (!regex.test(orcid)) {
    return false;
  }
  
  const digits = orcid.replace(/-/g, '').split('');
  const lastChar = digits.pop();
  const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar || '0');
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum = (sum + parseInt(digits[i])) * 2;
  }
  
  const remainder = sum % 11;
  const result = (12 - remainder) % 11;
  
  return checkDigit === result;
}

export async function validateUrl(
  url: string
): Promise<{ valid: boolean; repository: string | null }> {
  try {
    new URL(url);
  } catch {
    return { valid: false, repository: null };
  }
  
  let repository: string | null = null;
  for (const repo of KNOWN_REPOSITORIES) {
    if (repo.pattern.test(url)) {
      repository = repo.name;
      break;
    }
  }
  
  try {
    const response = await fetch('/api/validate-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      return { valid: false, repository };
    }
    
    const data = await response.json();
    return { valid: data.reachable, repository };
  } catch {
    return { valid: false, repository };
  }
}

export function computeCoreMetadataStatus(basis: CoreMetadata): ModuleStatus {
  const hasResearchDomain = basis.researchDomain !== null;
  const hasOrcid = basis.orcid.length > 0;
  const orcidValid = basis.orcidValidated;
  
  if (hasResearchDomain && hasOrcid && orcidValid) {
    return 'complete';
  }
  
  return 'incomplete';
}

export function computeDataObjectMetadataStatus(
  dataset: DataObjectMetadata
): ModuleStatus {
  const hasLicense = dataset.license.length > 0;
  const hasMimeType = dataset.mimeType.length > 0;
  const hasDataUrl = dataset.dataUrl.length > 0;
  const dataUrlValid = dataset.dataUrlValidated;

  if (!hasDataUrl) {
    return 'pristine';
  }

  if (hasLicense && hasMimeType && hasDataUrl && dataUrlValid) {
    return 'complete';
  }
  
  return 'incomplete';
}

export function computeSoftwareMetadataStatus(
  software: SoftwareMetadata
): ModuleStatus {
  const hasRepo = software.repositoryType.length > 0;
  const hasRepoUrl = software.repositoryUrl.length > 0;
  const repoUrlValid = software.repositoryUrlValidated;
  const hasLicense = software.license.length > 0;
  const hasReadme = software.readmeUrl.length > 0;

  if (!hasRepoUrl) {
    return 'pristine';
  }

  if (hasRepo && hasRepoUrl && repoUrlValid && hasLicense && hasReadme) {
    return 'complete';
  }
  
  return 'incomplete';
}

export function computePublicationMetadataStatus(
  publication: PublicationMetadata
): ModuleStatus {

  const hasDoi = publication.doi.length > 0;
  const hasTitle = publication.title.length > 0;
  const hasCreators = publication.creators.length > 0;

  if (!hasDoi) {
    return 'pristine';
  }

  if (hasDoi && hasTitle && hasCreators) {
    return 'complete';
  }
  
  return 'incomplete';
}

export function computeMiscMetadataStatus(misc: MiscMetadata | null): ModuleStatus {

  if (!misc || misc.entries.length === 0) {
    return 'pristine';
  }
  
  return 'complete';
}
