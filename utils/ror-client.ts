export interface RORResult {
    id: string;
    names: Array<{
        value: string;
        types?: string[];
    }>;
}

export interface RORSearchResponse {
    items: RORResult[];
}

export async function searchROR(query: string): Promise<RORResult[]> {
    if (query.length < 5) {
        return [];
    }

    try {
        const response = await fetch(
            `https://api.ror.org/organizations?query=${encodeURIComponent(query)}`
        );
        
        if (!response.ok) {
            throw new Error(`ROR API error: ${response.status}`);
        }
        
        const data: RORSearchResponse = await response.json();
        
        if (data.items && data.items.length > 0) {
            return data.items;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching ROR suggestions:', error);
        return [];
    }
}

export function formatRORDisplay(item: RORResult): string {
    const displayName = item.names.find(
        name => name.types && name.types.includes('ror_display')
    )?.value || item.names[0].value;
    
    return `${displayName} (${item.id})`;
}
