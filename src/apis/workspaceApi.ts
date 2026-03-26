import apiBase from './config';
import {
  Workspace,
  Team,
  Role,
  WorkspaceMember,
  WorkspaceMemberRole,
  TeamMember,
  Permission,
  TeamInvitation,
  WorkspaceInvitation,
  InvitationResponse,
} from '@/interfaces/workspace';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  CreateTeamDto,
  UpdateTeamDto,
  CreateRoleDto,
  UpdateRoleDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  RespondInvitationDto,
} from '@/dtos/workspaceDto';

// ==================== Workspace APIs ====================
const getAllWorkspaces = async (): Promise<Workspace[]> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace`)
    .then((res: any) => res.data.data);
};

const getWorkspaceById = async (workspaceId: string): Promise<Workspace> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}`)
    .then((res: any) => res.data.data);
};

const createWorkspace = async (
  payload: CreateWorkspaceDto
): Promise<Workspace> => {
  return await apiBase
    .post(`${process.env.NEXT_PUBLIC_DEV_API}/workspace`, payload)
    .then((res: any) => res.data.data);
};

const updateWorkspace = async (
  workspaceId: string,
  payload: UpdateWorkspaceDto
): Promise<Workspace> => {
  return await apiBase
    .patch(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}`,
      payload
    )
    .then((res: any) => res.data.data);
};

const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  return await apiBase
    .delete(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}`)
    .then((res: any) => res.data.data);
};

const leaveWorkspace = async (workspaceId: string): Promise<void> => {
  return await apiBase
    .post(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/leave`)
    .then((res: any) => res.data.data);
};

// ==================== Team APIs ====================
const getTeamsByWorkspace = async (workspaceId: string): Promise<Team[]> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/team`)
    .then((res: any) => res.data.data);
};

const getTeamById = async (teamId: string): Promise<Team> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}`)
    .then((res: any) => res.data.data);
};

const createTeam = async (
  workspaceId: string,
  payload: CreateTeamDto
): Promise<Team> => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/team`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateTeam = async (
  teamId: string,
  payload: UpdateTeamDto
): Promise<Team> => {
  return await apiBase
    .patch(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}`,
      payload
    )
    .then((res: any) => res.data.data);
};

const deleteTeam = async (teamId: string): Promise<void> => {
  return await apiBase
    .delete(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}`)
    .then((res: any) => res.data.data);
};

const addPackageToTeam = async (
  teamId: string,
  packageId: string
): Promise<void> => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/package`,
      { packageId }
    )
    .then((res: any) => res.data.data);
};

const removePackageFromTeam = async (
  teamId: string,
  packageId: string
): Promise<void> => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/package/${packageId}`
    )
    .then((res: any) => res.data.data);
};

// ==================== Role APIs ====================
const getRolesByTeam = async (teamId: string): Promise<Role[]> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/role`)
    .then((res: any) => res.data.data);
};

const createRole = async (
  teamId: string,
  payload: CreateRoleDto
): Promise<Role> => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/role`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateRole = async (
  teamId: string,
  roleId: string,
  payload: UpdateRoleDto
): Promise<Role> => {
  return await apiBase
    .patch(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/role/${roleId}`,
      payload
    )
    .then((res: any) => res.data.data);
};

const deleteRole = async (teamId: string, roleId: string): Promise<void> => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/role/${roleId}`
    )
    .then((res: any) => res.data.data);
};

// ==================== Permission APIs ====================
const getAllPermissions = async (): Promise<Permission[]> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/permissions`)
    .then((res: any) => res.data.data);
};

// ==================== Member APIs ====================
const getWorkspaceMembers = async (
  workspaceId: string
): Promise<WorkspaceMember[]> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/member`)
    .then((res: any) => res.data.data);
};

const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/member`)
    .then((res: any) => res.data.data);
};

const inviteTeamMember = async (
  teamId: string,
  payload: InviteMemberDto
): Promise<TeamInvitation> => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/member/invitation`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateTeamMemberRole = async (
  teamId: string,
  memberId: string,
  payload: UpdateMemberRoleDto
): Promise<TeamMember> => {
  return await apiBase
    .patch(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/member/${memberId}/role`,
      payload
    )
    .then((res: any) => res.data.data);
};

const removeTeamMember = async (
  teamId: string,
  memberId: string
): Promise<void> => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/team/${teamId}/member/${memberId}`
    )
    .then((res: any) => res.data.data);
};

const inviteWorkspaceMember = async (
  workspaceId: string,
  payload: { email: string; role: WorkspaceMemberRole }
): Promise<WorkspaceInvitation> => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/member/invitation`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateWorkspaceMemberRole = async (
  workspaceId: string,
  memberId: number,
  payload: { role: WorkspaceMemberRole }
): Promise<WorkspaceMember> => {
  return await apiBase
    .patch(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/member/${memberId}/role`,
      payload
    )
    .then((res: any) => res.data.data);
};

const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: number
): Promise<void> => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/member/${memberId}`
    )
    .then((res: any) => res.data.data);
};

// ==================== Invitation APIs ====================
const getMyInvitations = async (): Promise<InvitationResponse> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/workspace/invitation/me`)
    .then((res: any) => res.data.data);
};

const respondToInvitation = async (
  payload: RespondInvitationDto
): Promise<void> => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/invitation/response`,
      payload
    )
    .then((res: any) => res.data.data);
};

// ==================== Workspace Process APIs ====================
const getWorkspaceProcesses = async (
  workspaceId: string,
  limit: number,
  page: number
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes?limit=${limit}&page=${page}`
    )
    .then((res: any) => res.data.data);
};  

const getWorkspaceProcessCount = async (workspaceId: string) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/count`
    )
    .then((res: any) => res.data.data);
};

const getWorkspaceProcessById = async (
  workspaceId: string,
  processId: string
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/${processId}`
    )
    .then((res: any) => res.data.data);
};

const createWorkspaceProcess = async (workspaceId: string, payload: any) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateWorkspaceProcess = async (
  workspaceId: string,
  processId: string,
  payload: any
) => {
  return await apiBase
    .put(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/${processId}`,
      payload
    )
    .then((res: any) => res.data.data);
};

const deleteWorkspaceProcess = async (
  workspaceId: string,
  processId: string
) => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/${processId}`
    )
    .then((res: any) => res.data.data);
};

const saveWorkspaceProcess = async (
  workspaceId: string,
  processId: string,
  payload: any
) => {
  return await apiBase
    .put(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/${processId}/save`,
      payload
    )
    .then((res: any) => res.data.data);
};

const shareWorkspaceProcess = async (
  workspaceId: string,
  processId: string,
  emails: string[]
) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/${processId}/share`,
      { emails }
    )
    .then((res: any) => res.data.data);
};

const getWorkspaceProcessShared = async (
  workspaceId: string,
  processId: string
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/processes/${processId}/shared`
    )
    .then((res: any) => res.data.data);
};

// ==================== Workspace Robot APIs ====================
const getWorkspaceRobots = async (
  workspaceId: string,
  limit: number,
  page: number
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots?limit=${limit}&page=${page}`
    )
    .then((res: any) => res.data.data);
};

const getWorkspaceRobotCount = async (workspaceId: string) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/count`
    )
    .then((res: any) => res.data.data);
};

const getWorkspaceRobotById = async (
  workspaceId: string,
  robotKey: string
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}`
    )
    .then((res: any) => res.data.data);
};

const createWorkspaceRobot = async (workspaceId: string, payload: any) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateWorkspaceRobot = async (
  workspaceId: string,
  robotKey: string,
  payload: any
) => {
  return await apiBase
    .put(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}`,
      payload
    )
    .then((res: any) => res.data.data);
};

const deleteWorkspaceRobot = async (
  workspaceId: string,
  robotKey: string
) => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}`
    )
    .then((res: any) => res.data.data);
};

// Run workspace robot
const runWorkspaceRobot = async (
  workspaceId: string,
  robotKey: string,
  runParams?: any
) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/run`,
      runParams || {}
    )
    .then((res: any) => res.data.data);
};

// Stop workspace robot
const stopWorkspaceRobot = async (
  workspaceId: string,
  robotKey: string
) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/stop`
    )
    .then((res: any) => res.data.data);
};

// Get workspace robot logs
const getWorkspaceRobotLogs = async (
  workspaceId: string,
  robotKey: string,
  logGroup: string,
  options?: {
    limit?: number;
    startTime?: number;
    endTime?: number;
  }
) => {
  const params = new URLSearchParams({ logGroup });
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.startTime) params.append('startTime', options.startTime.toString());
  if (options?.endTime) params.append('endTime', options.endTime.toString());

  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/logs?${params.toString()}`
    )
    .then((res: any) => res.data.data);
};

// Get workspace robot schedule
const getWorkspaceRobotSchedule = async (
  workspaceId: string,
  robotKey: string
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/schedule`
    )
    .then((res: any) => res.data.data);
};

// Create or update workspace robot schedule
const createOrUpdateWorkspaceRobotSchedule = async (
  workspaceId: string,
  robotKey: string,
  scheduleDto: any
) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/schedule`,
      scheduleDto
    )
    .then((res: any) => res.data.data);
};

// Delete workspace robot schedule
const deleteWorkspaceRobotSchedule = async (
  workspaceId: string,
  robotKey: string
) => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/schedule`
    )
    .then((res: any) => res.data.data);
};

const getWorkspaceRobotConnections = async (
  workspaceId: string,
  robotKey: string
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/robots/${robotKey}/connections`
    )
    .then((res: any) => res.data.data);
};

// ==================== Workspace Connection APIs ====================
const getWorkspaceConnections = async (
  workspaceId: string,
  provider?: string
) => {
  const params = provider ? { provider } : {};
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/connections`,
      { params }
    )
    .then((res: any) => res.data.data);
};

const getWorkspaceConnection = async (
  workspaceId: string,
  provider: string,
  name: string
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/connections/${encodeURIComponent(provider)}/${encodeURIComponent(name)}`
    )
    .then((res: any) => res.data.data);
};

const createWorkspaceConnection = async (
  workspaceId: string,
  payload: {
    name: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
  }
) => {
  return await apiBase
    .post(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/connections`,
      payload
    )
    .then((res: any) => res.data.data);
};

const updateWorkspaceConnection = async (
  workspaceId: string,
  provider: string,
  name: string,
  payload: {
    accessToken?: string;
    refreshToken?: string;
  }
) => {
  return await apiBase
    .put(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/connections/${encodeURIComponent(provider)}/${encodeURIComponent(name)}`,
      payload
    )
    .then((res: any) => res.data.data);
};

const deleteWorkspaceConnection = async (
  workspaceId: string,
  provider: string,
  name: string
) => {
  return await apiBase
    .delete(
      `${process.env.NEXT_PUBLIC_DEV_API}/workspace/${workspaceId}/connections/${encodeURIComponent(provider)}/${encodeURIComponent(name)}`
    )
    .then((res: any) => res.data.data);
};

// ==================== Workspace Dashboard APIs ====================

import type {
  RobotStatusCounts,
  DashboardJobsHistory,
  DashboardTransactions,
} from './robotReportApi';

/**
 * Get aggregated robot status counts for a workspace
 * Calls GET /workspace/:workspaceId/dashboard/all-statuses
 * TODO: Remove mock fallback once backend implements this endpoint
 * @see docs/workspace-dashboard-api-docs.md
 */
const getWorkspaceDashboardRobotStatuses = async (
  workspaceId: string
): Promise<RobotStatusCounts> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/dashboard/${workspaceId}/all-statuses`
    );
    return res.data;
  } catch {
    return {
      running: 0,
      stopped: 2,
      terminating: 0,
      idle: 3,
      robots: [],
      triggerTypeCounts: { manual: 4, schedule: 3, 'event-gmail': 1 },
    };
  }
};

/**
 * Get aggregated jobs history for a workspace
 * Calls GET /workspace/:workspaceId/dashboard/jobs-history
 * TODO: Remove mock fallback once backend implements this endpoint
 * @see docs/workspace-dashboard-api-docs.md
 */
const getWorkspaceDashboardJobsHistory = async (
  workspaceId: string,
  date?: string
): Promise<DashboardJobsHistory> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/dashboard/${workspaceId}/jobs-history`;
    if (date) url += `?date=${date}`;
    const res = await apiBase.get(url);
    return res.data;
  } catch {
    return { successful: 8, faulted: 3, stopped: 1, total: 12 };
  }
};

/**
 * Get aggregated transactions timeline for a workspace
 * Calls GET /workspace/:workspaceId/dashboard/transactions
 * TODO: Remove mock fallback once backend implements this endpoint
 * @see docs/workspace-dashboard-api-docs.md
 */
const getWorkspaceDashboardTransactions = async (
  workspaceId: string,
  date?: string,
  granularity?: 'minute' | 'hour' | 'day'
): Promise<DashboardTransactions> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/dashboard/${workspaceId}/transactions`;
    const params: string[] = [];
    if (date) params.push(`date=${date}`);
    if (granularity) params.push(`granularity=${granularity}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await apiBase.get(url);
    return res.data;
  } catch {
    // Generate mock data matching the granularity
    const now = new Date();
    if (granularity === 'minute') {
      const labels: string[] = [];
      const data: number[] = [];
      for (let i = 11; i >= 0; i--) {
        const t = new Date(now.getTime() - i * 5 * 60 * 1000);
        labels.push(
          `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
        );
        data.push(Math.floor(Math.random() * 5));
      }
      return { labels, data, total: data.reduce((a, b) => a + b, 0) };
    }
    if (granularity === 'hour') {
      const labels: string[] = [];
      const data: number[] = [];
      for (let i = 23; i >= 0; i--) {
        const t = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(`${String(t.getHours()).padStart(2, '0')}:00`);
        data.push(Math.floor(Math.random() * 6));
      }
      return { labels, data, total: data.reduce((a, b) => a + b, 0) };
    }
    // day
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(
        `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
      );
      data.push(Math.floor(Math.random() * 12));
    }
    return { labels, data, total: data.reduce((a, b) => a + b, 0) };
  }
};

const workspaceApi = {
  // Workspace
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  leaveWorkspace,

  // Team
  getTeamsByWorkspace,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addPackageToTeam,
  removePackageFromTeam,

  // Role
  getRolesByTeam,
  createRole,
  updateRole,
  deleteRole,

  // Permission
  getAllPermissions,

  // Member
  getWorkspaceMembers,
  getTeamMembers,
  inviteWorkspaceMember,
  inviteTeamMember,
  updateWorkspaceMemberRole,
  updateTeamMemberRole,
  removeWorkspaceMember,
  removeTeamMember,

  // Invitation
  getMyInvitations,
  respondToInvitation,

  // Workspace Process
  getWorkspaceProcesses,
  getWorkspaceProcessCount,
  getWorkspaceProcessById,
  createWorkspaceProcess,
  updateWorkspaceProcess,
  deleteWorkspaceProcess,
  saveWorkspaceProcess,
  shareWorkspaceProcess,
  getWorkspaceProcessShared,

  // Workspace Robot (separate from user robots)
  getWorkspaceRobots,
  getWorkspaceRobotCount,
  getWorkspaceRobotById,
  createWorkspaceRobot,
  updateWorkspaceRobot,
  deleteWorkspaceRobot,
  runWorkspaceRobot,
  stopWorkspaceRobot,
  getWorkspaceRobotLogs,
  getWorkspaceRobotSchedule,
  createOrUpdateWorkspaceRobotSchedule,
  deleteWorkspaceRobotSchedule,
  getWorkspaceRobotConnections,

  // Workspace Connections
  getWorkspaceConnections,
  getWorkspaceConnection,
  createWorkspaceConnection,
  updateWorkspaceConnection,
  deleteWorkspaceConnection,

  // Workspace Dashboard
  getWorkspaceDashboardRobotStatuses,
  getWorkspaceDashboardJobsHistory,
  getWorkspaceDashboardTransactions,
};

export default workspaceApi;
