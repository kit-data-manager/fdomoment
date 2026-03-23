import { NextRequest, NextResponse } from 'next/server';

interface CrossrefWork {
  message?: {
    title?: string[];
    type?: string;
    author?: Array<{
      given?: string;
      family?: string;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doi } = body;

    if (!doi) {
      return NextResponse.json(
        { error: 'DOI is required' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FDOCreator/1.0 (mailto:admin@example.com)',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'DOI nicht gefunden' },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: 'CrossRef API error' },
          { status: 500 }
        );
      }

      const data = (await response.json()) as CrossrefWork;
console.log("RESO ", data);
      if (!data.message) {
        return NextResponse.json(
          { error: 'No metadata found' },
          { status: 404 }
        );
      }

      const title = data.message.title?.[0] || '';
      const publicationType = data.message.type || '';
      const creators = (data.message.author || []).map(author => ({
        id: crypto.randomUUID(),
        name: `${author.family || ''} ${author.given || ''}`.trim(),
      }));

      return NextResponse.json({
        title,
        publicationType,
        creators,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
