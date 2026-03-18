import { NextRequest, NextResponse } from 'next/server';
import { DoiMetadata } from '@/utils/doi-utils';

interface CrossrefResponse {
  message: {
    total_results: number;
    items: Array<{
      title?: string[];
      publisher?: string;
      publication_type?: string;
      published_online?: { date_parts: number[][] };
      created?: { date_parts: number[][] };
      author?: Array<{
        given?: string;
        family?: string;
        orcid?: string;
      }>;
    }>;
  };
}

const extractMetaTag = (html: string, attrName: string): string | null => {
  const regex = new RegExp(
    `<meta[^>]+name=["']${attrName}["'][^>]*content=["']([^"']+)["']|` +
    `<meta[^>]+content=["']([^"']+)["'][^>]*name=["']${attrName}["']`,
    'i'
  );
  const match = html.match(regex);
  if (match) {
    return match[1] || match[2] || null;
  }
  return null;
};

const extractCreatorsFromMeta = (html: string): Array<{ name?: string; orcid?: string }> => {
  const creators: Array<{ name?: string; orcid?: string }> = [];
  
  const authorMatches = html.matchAll(/<meta[^>]+name=["'](author|creator)[^>]*content=["']([^"']+)["']/gi);
  for (const match of authorMatches) {
    creators.push({
      name: match[2]?.trim()
    });
  }
  
  return creators;
};

const extractCreatorOrcid = (html: string): string | null => {
  const orcidUrl = html.match(/name*identifier["'][^"']*orcid[^"']*["'][^>]*content=["'](https?:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{4})["']/i);
  if (orcidUrl && orcidUrl[1]) {
    try {
      return orcidUrl[1].replace('https://orcid.org/', '');
    } catch {
      return null;
    }
  }
  
  return null;
};

const findPublicationYear = (html: string): string | null => {
  const yearPatterns = [
    /<meta[^>]+name=["']date["'][^>]*content=["'](\d{4})["']/i,
    /<meta[^>]+name=["']publication_date["'][^>]*content=["'](\d{4})["']/i,
    /<meta[^>]+name=["']citation_date["'][^>]*content=["'](\d{4})["']/i,
    /<meta[^>]+property=["']dc\.date["'][^>]*content=["'](\d{4})["']/i,
    /pubdate["'][^>]*["'](\d{4})["']/i,
    /["']date["'][^>]*["'](\d{4})["']/i,
    /<meta[^>]+name=["']dc\.date["'][^>]*content=["'](\d{4})-[^"']*["']/i,
    /<meta[^>]+name=["']citation_date["'][^>]*content=["'](\d{4})-[^"']*["']/i,
    /<meta[^>]+property=["']dc\.date["'][^>]*content=["'](\d{4})["']/i
  ];
  
  for (const pattern of yearPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const fallbackResolveDoi = async (doi: string): Promise<DoiMetadata | null> => {
  const fallbackUrl = `https://doi.org/${doi}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(fallbackUrl, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    const metadata: DoiMetadata = {};
    
    const title = extractMetaTag(html, 'og:title') ||
                  extractMetaTag(html, 'dc.title') ||
                  extractMetaTag(html, 'citation_title');
    if (title) metadata.title = title;
    
    const creators = extractCreatorsFromMeta(html);
    if (creators.length > 0) {
      const creatorNames = creators
        .map(c => c.name)
        .filter((n): n is string => Boolean(n))
        .join(', ');
      if (creatorNames) metadata.creatorsString = creatorNames;
      
      const orcid = extractCreatorOrcid(html);
      if (orcid) {
        metadata.creators = [{ givenName: '', familyName: '', orcid }];
      }
    }
    
    const publisher = extractMetaTag(html, 'publisher') ||
                      extractMetaTag(html, 'dc.publisher') ||
                      extractMetaTag(html, 'citation_publisher');
    if (publisher) metadata.publisher = publisher;
    
    const pubYear = findPublicationYear(html);
    if (pubYear) metadata.publicationYear = pubYear;
    
    const pubType = extractMetaTag(html, 'dc.type') ||
                   extractMetaTag(html, 'publication_type');
    if (pubType) metadata.publicationType = pubType;
    
    return Object.keys(metadata).length > 0 ? metadata : null;
  } catch (error) {
    return null;
  }
};

const extractDoiFromUrl = (url: string): string | null => {
  const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = url.match(doiPattern);
  return match ? match[0] : null;
};

const fetchWithRedirects = async (url: string, maxRedirects: number = 5): Promise<Response> => {
  let currentUrl = url;
  let redirectCount = 0;
  
  while (redirectCount < maxRedirects) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      redirectCount++;
      const location = response.headers.get('location')!;
      const nextUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
      currentUrl = nextUrl;
      continue;
    }
    
    return response;
  }
  
  throw new Error('Too many redirects while resolving DOI');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doiInput } = body;
    
    if (!doiInput) {
      return NextResponse.json(
        { success: false, error: 'DOI input is required' },
        { status: 400 }
      );
    }
    
    let doi: string;
    
    if (doiInput.startsWith('http')) {
      const extractedDoi = extractDoiFromUrl(doiInput);
      if (!extractedDoi) {
        return NextResponse.json(
          { success: false, error: 'Could not extract DOI from URL' },
          { status: 400 }
        );
      }
      doi = extractedDoi;
    } else {
      doi = doiInput.trim();
    }
    
    if (!doi.startsWith('10.')) {
      doi = `10.${doi}`;
    }
    
    const apiUrl = `https://search.crossref.org/dois?q=doi:${doi}`;
    
    try {
      const response = await fetchWithRedirects(apiUrl);
      
      if (!response.ok) {
        const fallbackResult = await fallbackResolveDoi(doi);
        if (fallbackResult) {
          return NextResponse.json({ success: true, metadata: fallbackResult });
        }
        return NextResponse.json(
          { success: false, error: `Failed to resolve DOI: ${response.statusText}` },
          { status: 500 }
        );
      }
      
      const data = (await response.json()) as CrossrefResponse;
      
      if (data.message?.total_results === 0 || !data.message?.items?.[0]) {
        const fallbackResult = await fallbackResolveDoi(doi);
        if (fallbackResult) {
          return NextResponse.json({ success: true, metadata: fallbackResult });
        }
        return NextResponse.json(
          { success: false, error: 'DOI not found and fallback failed' },
          { status: 404 }
        );
      }
      
      const item = data.message.items[0];
      const metadata: DoiMetadata = {};
      
      if (item?.publication_type) {
        metadata.publicationType = item.publication_type;
      }
      
      if (item?.title && Array.isArray(item.title) && item.title.length > 0) {
        metadata.title = item.title[0];
      }
      
      if (item?.publisher) {
        metadata.publisher = item.publisher;
      }
      
      if (item?.published_online?.date_parts) {
        const year = item.published_online.date_parts[0]?.toString();
        if (year && year.length === 4) {
          metadata.publicationYear = year;
        }
      } else if (item?.created?.date_parts) {
        const year = item.created.date_parts[0]?.toString();
        if (year && year.length === 4) {
          metadata.publicationYear = year;
        }
      }
      
      if (item?.author && Array.isArray(item.author)) {
        const orcid = item.author.find((a: any) => a.orcid)?.orcid?.replace('https://orcid.org/', '');
        
        metadata.creators = item.author.map((a: any) => ({
          givenName: a.given,
          familyName: a.family,
          orcid: orcid
        }));
        
        const creatorNames = metadata.creators
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map(c => `${c.familyName || ''} ${c.givenName || ''}`.trim())
          .filter(Boolean)
          .join(', ');
        
        if (creatorNames) {
          metadata.creatorsString = creatorNames;
        }
      }
      
      return NextResponse.json({ success: true, metadata });
    } catch (error) {
      const fallbackResult = await fallbackResolveDoi(doi);
      if (fallbackResult) {
        return NextResponse.json({ success: true, metadata: fallbackResult });
      }
      
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Unknown error resolving DOI' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
