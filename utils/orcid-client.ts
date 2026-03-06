export interface ORCiDResult {
    'orcid-id': string;
    'given-names': string;
    'family-names': string;
    email?: string;
}

export async function searchORCiD(query: string): Promise<ORCiDResult[]> {
    if (query.length < 5) {
        return [];
    }

    try {
        const response = await fetch(
            `https://pub.orcid.org/v3.0/expanded-search/?q=email:${encodeURIComponent(query)}&start=0&rows=50`,
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
