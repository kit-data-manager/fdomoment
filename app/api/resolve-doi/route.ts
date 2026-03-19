import { NextRequest, NextResponse } from 'next/server';
import { DoiMetadata } from '@/utils/doi-utils';

interface CrossrefResponse {
  message: {
    items: Array<{
      title?: string[];
      publisher?: string;
      type?: string;
      published?: { 'date-parts': number[][] };
      'published-online'?: { 'date-parts': number[][] };
      created?: { 'date-parts': number[][] };
      author?: Array<{
        given?: string;
        family?: string;
        ORCID?: string;
        orcid?: string;
      }>;
    }>;
  };
}

interface ZenodoResponse {
      metadata: {
        title?: string;
        creators?: Array<{
          name?: string;
          orcid?: string;
        }>;
        publisher?: string;
        publication_date?: string;
        resource_type?: {
          type?: string;
        };
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
  } catch {
    return null;
  }
};

const extractDoiFromUrl = (url: string): string | null => {
  const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = url.match(doiPattern);
  return match ? match[0] : null;
};

const extractZenodoRecordId = (doi: string): string | null => {
  const zenodoPattern = /^10\.5281\/zenodo\.(\d+)$/i;
  const match = doi.match(zenodoPattern);
  return match ? match[1] : null;
};

const resolveZenodo = async (doi: string): Promise<DoiMetadata | null> => {
  const recordId = extractZenodoRecordId(doi);
  
  if (!recordId) {
    return null;
  }
  
  const apiUrl = `https://zenodo.org/api/records/${recordId}`;
  console.log("Getting Zenodo record from ", apiUrl);
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return null;
    }
    
    const data = (await response.json()) as ZenodoResponse;
    

    const metadata = data.metadata;
    console.log("Metadata", metadata);
    const result: DoiMetadata = {};
    
    if (metadata.title) {
      result.title = metadata.title;
    }
    
    if (metadata.creators && metadata.creators.length > 0) {
      result.creators = metadata.creators.map(creator => ({
        givenName: creator.name?.split(' ').slice(0, -1).join(' '),
        familyName: creator.name?.split(' ').pop(),
        orcid: creator.orcid?.replace('https://orcid.org/', '')
      }));

      console.log("Creators ", result.creators);

      const creatorNames = metadata.creators
        .map(c => c.name)
        .filter(Boolean)
        .join(', ');
      
      if (creatorNames) {
        result.creatorsString = creatorNames;
      }
    }
    
    if (metadata.publisher) {
      result.publisher = metadata.publisher;
    }
    
    if (metadata.publication_date) {
      const yearMatch = metadata.publication_date.match(/^(\d{4})/);
      if (yearMatch) {
        result.publicationYear = yearMatch[1];
      }
    }
    
    if (metadata.resource_type?.type) {
      result.publicationType = metadata.resource_type.type;
    }
    
    return result;
  } catch {
    return null;
  }
};

const resolveCrossref = async (doi: string): Promise<DoiMetadata | null> => {
  const apiUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return null;
    }
    
    const data = (await response.json()) as CrossrefResponse;
    
    if (!data.message?.items?.[0]) {
      return null;
    }
    
    const item = data.message.items[0];
    const metadata: DoiMetadata = {};
    
    if (item?.type) {
      metadata.publicationType = item.type;
    }
    
    if (item?.title && Array.isArray(item.title) && item.title.length > 0) {
      metadata.title = item.title[0];
    }
    
    if (item?.publisher) {
      metadata.publisher = item.publisher;
    }
    
    const publishedDate = item['published-online'] || item.published;
    if (publishedDate && publishedDate['date-parts']?.[0]?.[0]) {
      metadata.publicationYear = publishedDate['date-parts'][0][0].toString();
    } else if (item?.created?.['date-parts']?.[0]?.[0]) {
      metadata.publicationYear = item.created['date-parts'][0][0].toString();
    }
    
    if (item?.author && Array.isArray(item.author)) {
      type AuthorType = {
        given?: string;
        family?: string;
        ORCID?: string;
        orcid?: string;
      };
      
      const authors = item.author as AuthorType[];
      const orcid = authors.find(a => a.orcid || a.ORCID);
      const orcidValue = orcid ? (orcid.ORCID || orcid.orcid || '').replace('https://orcid.org/', '') : undefined;
      
      metadata.creators = authors.map(a => ({
        givenName: a.given,
        familyName: a.family,
        orcid: orcidValue
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
    
    return metadata;
  } catch {
    return null;
  }
};

const extractMetadataFromMetaTags = (html: string): DoiMetadata | null => {
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
      console.log("Following redirect -> ", location);
      const nextUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
      currentUrl = nextUrl;
      continue;
    }else{
      console.log("No redirect, status and location header not matching.");
    }

    return response;
  }
  
  throw new Error('Too many redirects while resolving DOI');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doiInput } = body;

    console.log("Resolving DOI ", doiInput);

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
    
    const landingPageUrl = `https://doi.org/${doi}`;
    console.log("Accessing landing page ", landingPageUrl);

    try {
      const landingResponse = await fetchWithRedirects(landingPageUrl);
      
      if (!landingResponse.ok) {
        console.log("Accessing landing page failed. Using fallback.");

        const fallbackResult = await fallbackResolveDoi(doi);
        console.log("Fallback result: ", fallbackResult);

        if (fallbackResult) {
          return NextResponse.json({ success: true, metadata: fallbackResult });
        }
        return NextResponse.json(
          { success: false, error: `Failed to resolve DOI: ${landingResponse.statusText}` },
          { status: 500 }
        );
      }
      
      const isZenodoDoi = extractZenodoRecordId(doi) !== null;
      
      if (isZenodoDoi) {
        console.log("Detected Zenodo DOI. Obtaining metadata via API.");

        const zenodoResult = await resolveZenodo(doi);
        console.log("Zenodo result: ", zenodoResult);

        if (zenodoResult) {
          return NextResponse.json({ success: true, metadata: zenodoResult });
        }
      }
      console.log("No response, yet. Trying crossref.");

      const crossrefResult = await resolveCrossref(doi);
      console.log("Crossref result: ", crossrefResult);

      if (crossrefResult) {
        return NextResponse.json({ success: true, metadata: crossrefResult });
      }

      console.log("Still no result, trying <meta> tags.");

      const htmlContent = await landingResponse.text();
      const metaResult = extractMetadataFromMetaTags(htmlContent);
      console.log("<meta> tags result: ", metaResult);

      if (metaResult && Object.keys(metaResult).length > 0) {
        return NextResponse.json({ success: true, metadata: metaResult });
      }
      
      return NextResponse.json(
        { success: false, error: 'Could not resolve DOI metadata' },
        { status: 404 }
      );
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
