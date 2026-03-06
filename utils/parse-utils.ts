export function parseNameAndId(displayValue: string): { id: string; name: string } | null {
    if (!displayValue.includes(' (')) {
        return null;
    }

    const parts = displayValue.split(' (');
    if (parts.length !== 2) {
        return null;
    }

    const name = parts[0].trim();
    const id = parts[1].replace(')', '').trim();

    return { id, name };
}
