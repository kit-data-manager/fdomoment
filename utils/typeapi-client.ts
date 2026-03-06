import { useState } from 'react';

// Define TypeScript interfaces for the API responses
interface TypeAPIResponse {
  id: string;
  name: string;
  fundamentalType: string;
  type: string;
  content?: { schema: any };
  schema?: any;
  style?: string;
}

// Cache for storing fetched types
const typeCache: Map<string, TypeAPIResponse> = new Map();

// Helper function to parse @id into prefix and suffix
const parseId = (id: string): { prefix: string, suffix: string } => {
  let cleanId = id;
  
  // Handle hdl: prefix - extract the actual ID
  if (id.startsWith('hdl:')) {
    cleanId = id.substring(4); // Remove 'hdl:' prefix
  }
  
  const parts = cleanId.split('/');
  if (parts.length < 2) {
    // Try splitting by colon as fallback
    const colonParts = cleanId.split(':');
    if (colonParts.length >= 2) {
      return {
        prefix: colonParts[0],
        suffix: colonParts.slice(1).join(':')
      };
    }
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
      const data: TypeAPIResponse[] = await response.json();

      const filteredData = data.filter((type) => type.style === 'eosc');

      // Cache the results (without schema - will be fetched later)
      filteredData.forEach(type => {
        // Store only basic info, schema will be fetched on demand
        const cachedType = { ...type, schema: undefined };
        typeCache.set(type.id, cachedType);
      });
      
      return filteredData;
    } catch (error) {
      console.error('Error searching types:', error);
      throw error;
    }
  }

  // Recursively resolve all @id references in a schema (only within "items" property)
  private async resolveSchemaReferences(schema: any): Promise<any> {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    // Handle array
    if (Array.isArray(schema)) {
      const resolvedArray: any[] = [];
      for (const item of schema) {
        resolvedArray.push(await this.resolveSchemaReferences(item));
      }
      return resolvedArray;
    }

    // Handle object
    const resolved: any = {};
    let itemsResolved: any = null;
    let propertiesResolved: any = null;
    
    // First pass: resolve all properties
    for (const key of Object.keys(schema)) {
      if (key === 'items') {
        // Resolve items and wrap into properties
        itemsResolved = await this.resolveSchemaReferences(schema[key]);
      } else if (key === '@id') {
        // Skip top-level @id - keep it as-is
        resolved[key] = schema[key];
      } else if (key === 'properties') {
        // Resolve existing properties
        propertiesResolved = await this.resolveSchemaReferences(schema[key]);
      } else {
        // Recursively process other properties
        resolved[key] = await this.resolveSchemaReferences(schema[key]);
      }
    }

    // Second pass: combine properties and items
    if (itemsResolved) {
      resolved['items'] =  itemsResolved ;
    }
    if (propertiesResolved) {
      if (resolved['properties']) {
        // Merge items and existing properties
        resolved['properties'] = { ...resolved['properties'], ...propertiesResolved };
      } else {
        resolved['properties'] = propertiesResolved;
      }
    }

    return resolved;
  }

  // Get a specific type by id
  async getTypeById(id: string): Promise<TypeAPIResponse> {
    // Check if already in cache with schema
    if (typeCache.has(id)) {
      const cached = typeCache.get(id)!;
      if (cached.schema) {
        return cached;
      }
    }

    try {
      // Parse id to get prefix and suffix
      const { prefix, suffix } = parseId(id);
      
      // Fetch type metadata first (without schema)
      const typeResponse = await fetch(`${this.baseUrl}/v1/types/${prefix}/${suffix}`);
      if (!typeResponse.ok) {
        throw new Error(`Get type failed: ${typeResponse.status} ${typeResponse.statusText}`);
      }
      
      const typeData: TypeAPIResponse = await typeResponse.json();
      
      // Then fetch the schema
      const schemaResponse = await fetch(`${this.baseUrl}/v1/types/schema/${prefix}/${suffix}`);
      let schemaData: any = {};
      if (schemaResponse.ok) {
        schemaData = await schemaResponse.json();
        
        // Recursively resolve all @id references in the schema
        schemaData = await this.resolveSchemaReferences(schemaData);
      }
      
      // Combine type metadata with schema
      const typeWithSchema: TypeAPIResponse = {
        ...typeData,
        schema: schemaData
      };

      // Wrap root array schema into object for proper RJSF rendering
      const wrappedSchema = this.wrapArraySchema(typeWithSchema.schema, typeData.name);

      typeWithSchema.schema = wrappedSchema;
      
      // Cache the result
      typeCache.set(id, typeWithSchema);
      
      return typeWithSchema;
    } catch (error) {
      console.error('Error getting type by id:', error);
      throw error;
    }
  }

  // Wrap root array schema into object for proper RJSF rendering
  private wrapArraySchema(schema: any, typeName?: string): any {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }
    // If root type is array, wrap it into an object with properties using type name
    if (schema.type === 'array' && schema.items) {
      const propertyName = typeName || 'items';
      const res = {
        type: 'object',
        properties: {
          [propertyName]: {
            type: 'array',
            title: typeName,
            items: schema.items
          }
        }
      };
      console.log(res);
      return res;
    }


    return schema;
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
            // Replace the property with the resolved nested type schema
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
