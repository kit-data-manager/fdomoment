export interface ORCiDMetadata {
    name: string;
    email: string | null;
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
