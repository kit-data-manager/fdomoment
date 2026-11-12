export interface DoiMetadata {
  publicationType?: string;
  title?: string;
  publisher?: string;
  publicationYear?: string;
  creators?: Array<{
    givenName?: string;
    familyName?: string;
    orcid?: string;
  }>;
  creatorsString?: string;
}
