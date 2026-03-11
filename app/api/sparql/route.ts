import { NextRequest, NextResponse } from 'next/server';

interface ValidatorArgument {
  key: string;
  value: string;
}

async function executeSparql(endpoint: string, query: string, term: string, validatorArgs?: ValidatorArgument[]) {
  const interpolatedQuery = query.replaceAll('${term}', term);
  const normalizedQuery = interpolatedQuery.replace(/\n/g, '\r\n');
  
  const params = new URLSearchParams();
  if (validatorArgs) {
    for (const arg of validatorArgs) {
      params.append(arg.key, arg.value);
    }
  }
  params.set('query', normalizedQuery);
  
  const url = `${endpoint}?${params.toString()}`;
  
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json'
    }
  });
  
  const responseText = await res.text();
  
  //console.log('SPARQL response status:', res.status);
  //console.log('SPARQL response (first 500 chars):', responseText.substring(0, 500));
  
  if (!res.ok) {
    throw new Error(`SPARQL endpoint error: ${res.status}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
    console.log("First binding sample:", data.results?.bindings?.[0]);
  } catch (parseError) {
    console.error('Failed to parse SPARQL response:', responseText.substring(0, 500));
    throw new Error('Invalid JSON response from SPARQL endpoint');
  }

  return data.results?.bindings?.map((b: any) => {
    console.log('SPARQL binding:', b);
    const result = {
      label: b.label?.value || b.iri?.value || '',
      uri: b.iri?.value || b.concept?.value || ''
    };
    console.log('Mapped result:', result);
    return result;
  }) || [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, query, term, arguments: validatorArgs } = body;

    if (!endpoint || !query || !term) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const results = await executeSparql(endpoint, query, term, validatorArgs);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('SPARQL query error:', error);
    return NextResponse.json({ error: 'Failed to execute SPARQL query', details: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || '';
  const query = searchParams.get('query') || '';
  const term = searchParams.get('term') || '';

  if (!endpoint || !query || !term) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const results = await executeSparql(endpoint, query, term);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('SPARQL query error:', error);
    return NextResponse.json({ error: 'Failed to execute SPARQL query', details: String(error) }, { status: 500 });
  }
}
