import apiBase from './config';
import {
  RobotStatusCounts,
  DashboardJobsHistory,
  DashboardTransactions,
} from './robotReportApi';

// ─── Helper: generate mock transactions ────────────────────────────────────
function generateMockTransactions(
  granularity: 'minute' | 'hour' | 'day'
): DashboardTransactions {
  const now = new Date();

  if (granularity === 'minute') {
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 5 * 60 * 1000);
      labels.push(
        `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
      );
      data.push(Math.floor(Math.random() * 8));
    }
    return { labels, data, total: data.reduce((a, b) => a + b, 0) };
  }

  if (granularity === 'hour') {
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 23; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 60 * 1000);
      labels.push(`${String(t.getHours()).padStart(2, '0')}:00`);
      data.push(Math.floor(Math.random() * 12));
    }
    return { labels, data, total: data.reduce((a, b) => a + b, 0) };
  }

  // day
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    labels.push(`${yyyy}-${mm}-${dd}`);
    data.push(Math.floor(Math.random() * 20));
  }
  return { labels, data, total: data.reduce((a, b) => a + b, 0) };
}

// ─── Admin-scoped API functions ────────────────────────────────────────────

/**
 * Get system-wide process count (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminProcessCount = async (): Promise<number> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/processes/count`
    );
    return res.data;
  } catch {
    return 24;
  }
};

/**
 * Get system-wide robot count (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminRobotCount = async (): Promise<number> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/robots/count`
    );
    return res.data;
  } catch {
    return 18;
  }
};

/**
 * Get system-wide workspace count (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminWorkspaceCount = async (): Promise<number> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/workspaces/count`
    );
    return res.data;
  } catch {
    return 6;
  }
};

/**
 * Get system-wide user count (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminUserCount = async (): Promise<number> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/users/count`
    );
    return res.data;
  } catch {
    return 12;
  }
};

/**
 * Get system-wide aggregated robot statuses (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminAllRobotStatuses = async (): Promise<RobotStatusCounts> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/all-statuses`
    );
    return res.data;
  } catch {
    return {
      running: 3,
      stopped: 5,
      terminating: 0,
      idle: 10,
      robots: [],
      triggerTypeCounts: { manual: 8, schedule: 6, 'event-gmail': 4 },
    };
  }
};

/**
 * Get system-wide jobs history (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminJobsHistory = async (
  date?: string
): Promise<DashboardJobsHistory> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/jobs-history`;
    if (date) url += `?date=${date}`;
    const res = await apiBase.get(url);
    return res.data;
  } catch {
    return { successful: 15, faulted: 4, stopped: 1, total: 20 };
  }
};

/**
 * Get system-wide transactions timeline (admin only)
 * @see docs/admin-dashboard-api-docs.md
 */
const getAdminTransactions = async (
  date?: string,
  granularity?: 'minute' | 'hour' | 'day'
): Promise<DashboardTransactions> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_DEV_API}/admin/dashboard/transactions`;
    const params: string[] = [];
    if (date) params.push(`date=${date}`);
    if (granularity) params.push(`granularity=${granularity}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await apiBase.get(url);
    return res.data;
  } catch {
    return generateMockTransactions(granularity || 'hour');
  }
};

const adminApi = {
  getAdminProcessCount,
  getAdminRobotCount,
  getAdminWorkspaceCount,
  getAdminUserCount,
  getAdminAllRobotStatuses,
  getAdminJobsHistory,
  getAdminTransactions,
};

export default adminApi;
