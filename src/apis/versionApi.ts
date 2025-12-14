import {
  Version,
  VersionListResponse,
  VersionCompareResult,
  CreateVersionDto,
  UpdateVersionDto,
} from '@/interfaces/version';
import apiBase from './config';
import { mockVersions, mockCompareResult } from '@/mocks/versionMockData';

const USE_MOCK = true; // Toggle to switch between mock and real API

/**
 * Get all versions for a process
 */
const getAllVersions = async (
  processId: string,
  page: number = 1,
  limit: number = 20
): Promise<VersionListResponse> => {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      versions: mockVersions,
      total: mockVersions.length,
      page,
      limit,
    };
  }

  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions?page=${page}&limit=${limit}`
    )
    .then((res: any) => res.data);
};

/**
 * Get a single version by ID
 */
const getVersionById = async (
  processId: string,
  versionId: string
): Promise<Version> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const version = mockVersions.find((v) => v.id === versionId);
    if (!version) throw new Error('Version not found');
    return version;
  }

  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions/${versionId}`
    )
    .then((res: any) => res.data);
};

/**
 * Create a new version
 */
const createVersion = async (
  processId: string,
  payload: CreateVersionDto
): Promise<Version> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newVersion: Version = {
      id: `version-${Date.now()}`,
      tag: payload.tag,
      description: payload.description,
      createdBy: {
        id: 'current-user',
        name: 'Current User',
        email: 'user@example.com',
      },
      createdAt: new Date().toISOString(),
      processId,
      xml: mockVersions[0]?.xml || '',
      variables: {},
      activities: [],
    };
    return newVersion;
  }

  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions`,
      payload
    )
    .then((res: any) => res.data);
};

/**
 * Update version metadata
 */
const updateVersion = async (
  processId: string,
  versionId: string,
  payload: UpdateVersionDto
): Promise<Version> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const version = mockVersions.find((v) => v.id === versionId);
    if (!version) throw new Error('Version not found');
    return {
      ...version,
      ...payload,
    };
  }

  return await apiBase
    .put(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions/${versionId}`,
      payload
    )
    .then((res: any) => res.data);
};

/**
 * Delete a version
 */
const deleteVersion = async (
  processId: string,
  versionId: string
): Promise<void> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return;
  }

  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions/${versionId}`
    )
    .then((res: any) => res.data);
};

/**
 * Restore a version as the current/latest
 */
const restoreVersion = async (
  processId: string,
  versionId: string
): Promise<{ message: string; restoredVersion: Version }> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const version = mockVersions.find((v) => v.id === versionId);
    if (!version) throw new Error('Version not found');
    return {
      message: 'Version restored successfully',
      restoredVersion: { ...version, isCurrent: true },
    };
  }

  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions/${versionId}/restore`
    )
    .then((res: any) => res.data);
};

/**
 * Compare two versions
 */
const compareVersions = async (
  processId: string,
  baseVersionId: string,
  compareVersionId: string
): Promise<VersionCompareResult> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockCompareResult;
  }

  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions/compare?baseVersionId=${baseVersionId}&compareVersionId=${compareVersionId}`
    )
    .then((res: any) => res.data);
};

/**
 * Download version as BPMN file
 */
const downloadVersion = async (
  processId: string,
  versionId: string
): Promise<Blob> => {
  if (USE_MOCK) {
    const version = mockVersions.find((v) => v.id === versionId);
    if (!version) throw new Error('Version not found');
    return new Blob([version.xml], { type: 'application/xml' });
  }

  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/processes/${processId}/versions/${versionId}/download`,
      { responseType: 'blob' }
    )
    .then((res: any) => res.data);
};

const versionApi = {
  getAllVersions,
  getVersionById,
  createVersion,
  updateVersion,
  deleteVersion,
  restoreVersion,
  compareVersions,
  downloadVersion,
};

export default versionApi;

