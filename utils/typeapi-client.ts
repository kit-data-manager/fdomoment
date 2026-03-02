import { useState, useEffect } from 'react';

// Define TypeScript interfaces for the API responses
interface TypeAPIResponse {
  id: string;
  name: string;
  type: string;
  schema: any;
}

interface TypeSearchResponse {
  content: TypeAPIResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Cache for storing fetched types
const typeCache: Map<string, TypeAPIResponse> = new Map();

// Helper function to parse @id into prefix and suffix
const parseId = (id: string): { prefix: string, suffix: string } => {
  const parts = id.split(':');
  if (parts.length < 2) {
    throw new Error(`Invalid @id format: ${id}`);
  }
  return {
    prefix: parts[0],
    suffix: parts.slice(1).join(':')
  };
};

// TypeAPI client class
export class TypeAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://typeapi.lab.pidconsortium.net') {
    this.baseUrl = baseUrl;
  }

  // Search for types based on query
  async searchTypes(query: string): Promise<TypeAPIResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/types/search/?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data: TypeSearchResponse = await response.json();
      
      // Cache the results
      data.content.forEach(type => {
        typeCache.set(type.id, type);
      });
      
      return data.content;
    } catch (error) {
      console.error('Error searching types:', error);
      throw error;
    }
  }

  // Get a specific type by id
  async getTypeById(id: string): Promise<TypeAPIResponse> {
    // Check if already in cache
    if (typeCache.has(id)) {
      return typeCache.get(id)!;
    }

    try {
      // Parse id to get prefix and suffix
      const { prefix, suffix } = parseId(id);
      
      const response = await fetch(`${this.baseUrl}/v1/types/${prefix}/${suffix}`);
      if (!response.ok) {
        throw new Error(`Get type failed: ${response.status} ${response.statusText}`);
      }
      
      const type: TypeAPIResponse = await response.json();
      
      // Cache the result
      typeCache.set(id, type);
      
      return type;
    } catch (error) {
      console.error('Error getting type by id:', error);
      throw error;
    }
  }

  // Recursively resolve nested types for FdoCombinedAttribute
  async resolveNestedTypes(type: TypeAPIResponse): Promise<TypeAPIResponse> {
    if (type.type !== 'FdoCombinedAttribute') {
      return type;
    }

    try {
      // Create a copy of the type to avoid mutating the original
      const resolvedType = { ...type };
      
      // Recursively resolve any nested types in the schema
      if (resolvedType.schema && resolvedType.schema.properties) {
        const properties = resolvedType.schema.properties;
        
        for (const key in properties) {
          if (properties[key].type === 'object' && properties[key]['@id']) {
            // Recursively resolve the nested type
            const nestedType = await this.getTypeById(properties[key]['@id']);
            // Replace the property with the resolved nested type
            properties[key] = { ...properties[key], ...nestedType.schema };
          }
        }
      }
      
      return resolvedType;
    } catch (error) {
      console.error('Error resolving nested types:', error);
      throw error;
    }
  }
}

// React hook for using the TypeAPI client
export const useTypeAPI = () => {
  const [client] = useState(new TypeAPIClient());

  return {
    searchTypes: client.searchTypes.bind(client),
    getTypeById: client.getTypeById.bind(client),
    resolveNestedTypes: client.resolveNestedTypes.bind(client)
  };
}