import {NextResponse} from 'next/server';

const GITHUB_API_BASE = "https://api.github.com/repos/ThomasJejkal/simple-type-registry/git/trees/main?recursive=1";
const TYPES_PATH = "types";
const TYPE_REGISTRY_BASE = "https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types";

interface TypeDefinition {
    pid: string;
    name: string;
    description: string;
    validator: "JSON" | "SPARQL" | "LINK";
    validatorInput?: string;
    validatorEndpoint?: string;
    validatorArguments?: Array<{ key: string; value: string }>;
}

const isValidValidator = (validator: string): validator is "JSON" | "SPARQL" => {
    return validator === "JSON" || validator === "SPARQL" || validator === "LINK";
};

const cache = {
    types: null as TypeDefinition[] | null,
    timestamp: 0,
    TTL: 5 * 60 * 1000 // 5 minutes cache
};

export async function GET() {
    const now = Date.now();

    if (cache.types && now - cache.timestamp < cache.TTL) {
        return NextResponse.json({types: cache.types, cached: true});
    }

    try {
        const treeRes = await fetch(GITHUB_API_BASE, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });


        if (!treeRes.ok) {
            throw new Error(`Failed to fetch type registry tree: ${treeRes.status}`);
        }

        const treeData = await treeRes.json();

        const jsonFiles = treeData.tree
            .filter((item: any) => item.path.startsWith(TYPES_PATH) && item.path.endsWith('.json'))
            .map((item: any) => item.path.replace(`${TYPES_PATH}/`, ""));

        const types: TypeDefinition[] = [];

        for (const file of jsonFiles) {
            try {
                const res = await fetch(`${TYPE_REGISTRY_BASE}/${file}`);
                if (!res.ok) {
                    console.warn(`Failed to load type ${file}: ${res.status}`);
                    continue;
                }

                const type = await res.json();

                if (!type.pid || !type.name || !type.description) {
                    console.warn(`Invalid type definition in ${file}: missing required fields`);
                    continue;
                }

                if (!isValidValidator(type.validator)) {
                    console.warn(`Invalid validator in ${file}: "${type.validator}"`);
                    continue;
                }

                if (type.validator === "JSON" && !type.validatorInput) {
                    console.warn(`Invalid type definition in ${file}: JSON validator requires validatorInput`);
                    continue;
                }

                if (type.validator === "SPARQL" && !type.validatorInput) {
                    console.warn(`Invalid type definition in ${file}: SPARQL validator requires validatorInput`);
                    continue;
                }

                types.push(type as TypeDefinition);
            } catch (err) {
                console.warn(`Error parsing type ${file}:`, err);
            }
        }

        cache.types = types;
        cache.timestamp = now;

        return NextResponse.json({types, cached: false});
    } catch (error) {
        return NextResponse.json(
            {error: error instanceof Error ? error.message : 'Unknown error'},
            {status: 500}
        );
    }
}
