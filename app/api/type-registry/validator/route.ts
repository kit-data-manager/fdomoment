import { NextRequest, NextResponse } from 'next/server';
import { $RefParser } from '@hey-api/json-schema-ref-parser';

const TYPE_REGISTRY_BASE = "https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const validatorInput = searchParams.get('validatorInput');
  const validatorType = searchParams.get('validatorType');

  if (!validatorInput || !validatorType) {
    return NextResponse.json(
      { error: 'validatorInput and validatorType are required' },
      { status: 400 }
    );
  }

  const cacheKey = `${validatorType}:${validatorInput}`;
  const now = Date.now();

 /* if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data, cached: true });
    }
  }*/

  try {
    const url = `${TYPE_REGISTRY_BASE}/${validatorInput}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch validator config: ${res.status}`);
    }

    let data;
    if (validatorType === 'JSON') {
      data = await res.json();
      console.log("DATA ", data);
      data = await resolveSchema(data);
        console.log("Resolved ", data);
    } else if (validatorType === 'SPARQL') {
      data = await res.text();
    } else {
      throw new Error(`Invalid validator type: ${validatorType}`);
    }

    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json({ data, cached: false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }

    type JsonSchema = Record<string, unknown>;

    async function resolveSchema(
        schemaOrUrl: JsonSchema | string,
    ): Promise<JsonSchema> {
        const parser = new $RefParser();
        const bundled = await parser.bundle({
            pathOrUrlOrSchema: schemaOrUrl,
        });
        console.log("BUN ", bundled)
        return bundled as JsonSchema;
    }
}
