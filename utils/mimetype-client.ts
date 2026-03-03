interface MimeType {
  type: string;
  description: string;
}
// Function to get MIME types with caching
export const getMimeTypes = async (): Promise<MimeType[]> => {
    return [
        { type: 'text/plain', description: 'Plain Text' },
        { type: 'text/html', description: 'HTML Document' },
        { type: 'application/json', description: 'JSON Data' },
        { type: 'image/jpeg', description: 'JPEG Image' },
        { type: 'image/png', description: 'PNG Image' },
        { type: 'application/pdf', description: 'PDF Document' },
        { type: 'application/xml', description: 'XML Document' },
        { type: 'application/zip', description: 'ZIP Archive' },
        { type: 'audio/mpeg', description: 'MP3 Audio' },
        { type: 'video/mp4', description: 'MP4 Video' }
    ];
};

// Function to search MIME types by query
export const searchMimeTypes = async (query: string): Promise<MimeType[]> => {
  if (!query.trim()) {
    return [];
  }
  
  const allTypes = await getMimeTypes();
  
  // Filter by query (case insensitive)
  return allTypes.filter(item => 
    item.type.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );
};
