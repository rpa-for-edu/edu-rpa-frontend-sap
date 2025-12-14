/**
 * Version Interface Definitions
 * 
 * These interfaces define the structure of version-related data
 * for the BPMN process versioning feature.
 */

export interface Version {
  id: string;
  tag: string;
  description: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string; // ISO date string
  processId: string;
  xml: string; // BPMN XML content
  variables: Record<string, any>;
  activities: any[];
  isCurrent?: boolean;
}

export interface VersionChange {
  id: string;
  elementId: string;
  elementName: string;
  changeType: 'added' | 'changed' | 'moved' | 'removed';
  details?: string;
}

export interface VersionCompareResult {
  baseVersion: Version;
  compareVersion: Version;
  changes: VersionChange[];
  addedCount: number;
  changedCount: number;
  movedCount: number;
  removedCount: number;
}

export interface CreateVersionDto {
  tag: string;
  description: string;
}

export interface UpdateVersionDto {
  tag?: string;
  description?: string;
}

export interface VersionListResponse {
  versions: Version[];
  total: number;
  page: number;
  limit: number;
}

