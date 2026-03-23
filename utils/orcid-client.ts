export interface ORCiDResult {
    'orcid-id': string;
    'given-names': string;
    'family-names': string;
    email?: string;
}

export interface ORCiDMetadata {
    name: string;
    email: string | null;
}

export async function searchORCiD(query: string): Promise<ORCiDResult[]> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
        return [];
    }

    const parts = trimmedQuery.split(',');
    let searchQuery: string;
    
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        const familyName = parts[0].trim();
        const givenName = parts[1].trim();
        searchQuery = `family-name:${familyName}*+AND+given-names:${givenName}*`;
    } else {
        const safeQuery = trimmedQuery.replace(/([:*+?^${}()|[\]\\])/g, '\\$1');
        searchQuery = safeQuery;
    }

    try {
        const response = await fetch(
            `https://pub.orcid.org/v3.0/expanded-search/?q=${searchQuery}&start=0&rows=50`,
            {
                headers: {
                    "Accept": "application/vnd.orcid+json",
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`ORCID API error: ${response.status}`);
        }
        
        const data = await response.json();

        if (data['expanded-result'] && data['expanded-result'].length > 0) {
            return data['expanded-result'] as ORCiDResult[];
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching ORCID suggestions:', error);
        return [];
    }
}

export function formatORCiDDisplay(item: ORCiDResult): string {
    const name = `${item['family-names']}, ${item['given-names']}`;
    const id = item['orcid-id'];
    return `${name} (${id})`;
}

export async function getOrcidMetadata(orcidId: string): Promise<ORCiDMetadata | null> {
    const cleanId = orcidId.replace(/\s/g, '');
    
    try {
        const response = await fetch(
            `https://pub.orcid.org/v3.0/${cleanId}/person`,
            {
                headers: {
                    "Accept": "application/vnd.orcid+json",
                }
            }
        );
        
        if (!response.ok) {
            return null;
        }
        
        const person = await response.json();

        const givenNames = person['name']['given-names']?.['value'] || '';
        const familyNames = person['name']['family-name']?.['value'] || '';
        const name = `${givenNames} ${familyNames}`.trim() || null;
        
        let email: string | null = null;
        const mail = person['emails']?.['email']?.[0]?.['email'];
        if (mail && mail.length > 0) {
            email = mail;
        }
        
        if (!name && !email) {
            return null;
        }
        
        return {
            name: name || 'Verified via ORCiD',
            email: email || "eMail private",
        };
    } catch {
        return null;
    }
}
