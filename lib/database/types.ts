export interface FdoRecord {
  pid: string;
  userName: string;
  orcid: string;
  researchDomain: string;
  fairScore: number;
  createdAt: Date;
}

export interface FairCriteriumAggregation {
  userName: string;
  criterium: 'findable' | 'accessible' | 'interoperable' | 'reusable';
  total: number;
}

export interface User {
  userName: string;
  orcid?: string;
  email?: string;
  lastLogin: Date;
}

export interface AttributeTemplateEntry {
  id: string;
  key: string;
  value: string | any;
  attributeType: 'custom' | 'typed';
  isTyped?: boolean;
  typeDef?: any;
}

export interface AttributeTemplate {
  id: string;
  userName: string;
  name: string;
  entries: AttributeTemplateEntry[];
  createdAt: Date;
  updatedAt: Date;
}
