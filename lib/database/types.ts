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
