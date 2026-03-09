import apiBase from './config';

const getRobotLogDetail = async (
  streamID: string,
  processID: string,
  version: number
) => {
  return await apiBase
    .get(
      `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/detail?streamID=${streamID}&processID=${processID}&version=${version}`
    )
    .then((res: any) => {
      return res.data;
    });
};

const getReportOverall = async (
  processID: string,
  version: number,
  date?: string
) => {
  let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/overall?processID=${processID}&version=${version}&passed=1`;

  if (date) {
    url += `&date=${date}`;
  }

  return await apiBase.get(url).then((res: any) => {
    return res.data;
  });
};

const getReportAverageTime = async (
  processID: string,
  version: number,
  date?: string
) => {
  let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/overall/average?processID=${processID}&version=${version}&passed=1`;

  if (date) {
    url += `&date=${date}`;
  }

  return await apiBase.get(url).then((res: any) => {
    return res.data;
  });
};

const getReportGroupPassed = async (
  processID: string,
  version: number,
  date?: string
) => {
  let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/overall/group-passed?processID=${processID}&version=${version}`;

  if (date) {
    url += `&date=${date}`;
  }

  return await apiBase.get(url).then((res: any) => {
    return res.data;
  });
};

const getReportGroupError = async (
  processID: string,
  version: number,
  date?: string
) => {
  let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/overall/group-error?processID=${processID}&version=${version}`;

  if (date) {
    url += `&date=${date}`;
  }

  return await apiBase.get(url).then((res: any) => {
    return res.data;
  });
};

const getReportDetailFailures = async (
  processID: string,
  version: number,
  date?: string
) => {
  let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/overall/failures?processID=${processID}&version=${version}`;

  if (date) {
    url += `&date=${date}`;
  }
  return await apiBase.get(url).then((res: any) => {
    return res.data;
  });
};

export interface DashboardJobsHistory {
  successful: number;
  faulted: number;
  stopped: number;
  total: number;
}

export interface DashboardTransactions {
  labels: string[];
  data: number[];
  total: number;
}

/**
 * Get aggregated jobs history for dashboard (all robots)
 * Calls GET /robot-report/dashboard/jobs-history
 * TODO: Remove mock fallback once backend implements this endpoint
 * @see docs/dashboard-api-docs.md
 */
const getDashboardJobsHistory = async (
  date?: string
): Promise<DashboardJobsHistory> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/dashboard/jobs-history`;
    if (date) url += `?date=${date}`;
    const res = await apiBase.get(url);
    return res.data;
  } catch {
    // Mock data until backend implements
    return { successful: 6, faulted: 2, stopped: 0, total: 8 };
  }
};

/**
 * Get aggregated transactions timeline for dashboard (all robots)
 * Calls GET /robot-report/dashboard/transactions
 * TODO: Remove mock fallback once backend implements this endpoint
 * @param date - ISO date string for the start of the range
 * @param granularity - 'minute' | 'hour' | 'day' to control time bucket grouping
 * @see docs/dashboard-api-docs.md
 */
const getDashboardTransactions = async (
  date?: string,
  granularity?: 'minute' | 'hour' | 'day'
): Promise<DashboardTransactions> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/dashboard/transactions`;
    const params: string[] = [];
    if (date) params.push(`date=${date}`);
    if (granularity) params.push(`granularity=${granularity}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await apiBase.get(url);
    return res.data;
  } catch {
    // Generate mock data with proper granularity
    return generateMockTransactions(granularity || 'hour');
  }
};

/**
 * Generate mock transaction data with labels matching the selected granularity
 */
function generateMockTransactions(
  granularity: 'minute' | 'hour' | 'day'
): DashboardTransactions {
  const now = new Date();

  if (granularity === 'minute') {
    // Last hour: every 5 minutes → 12 data points
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 5 * 60 * 1000);
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      labels.push(`${hh}:${mm}`);
      data.push(Math.floor(Math.random() * 4));
    }
    return { labels, data, total: data.reduce((a, b) => a + b, 0) };
  }

  if (granularity === 'hour') {
    // Last day: every hour → 24 data points
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 23; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hh = String(t.getHours()).padStart(2, '0');
      labels.push(`${hh}:00`);
      data.push(Math.floor(Math.random() * 5));
    }
    return { labels, data, total: data.reduce((a, b) => a + b, 0) };
  }

  // granularity === 'day': Last week / 30 days
  const days = 7; // default to 7 for mock
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    labels.push(`${yyyy}-${mm}-${dd}`);
    data.push(Math.floor(Math.random() * 10));
  }
  return { labels, data, total: data.reduce((a, b) => a + b, 0) };
}

export interface RobotStatusItem {
  name: string;
  processId: string;
  processVersion: number;
  triggerType: string;
  scope: string;
  status: string | null;
}

export interface RobotStatusCounts {
  running: number;
  stopped: number;
  terminating: number;
  idle: number;
  robots: RobotStatusItem[];
  triggerTypeCounts: Record<string, number>;
}

/**
 * Get aggregated robot status counts for the current user
 * Calls GET /robot/all-statuses
 * TODO: Remove mock fallback once backend implements this endpoint
 * @see docs/dashboard-api-docs.md
 */
const getAllRobotStatuses = async (): Promise<RobotStatusCounts> => {
  try {
    const res = await apiBase.get(
      `${process.env.NEXT_PUBLIC_DEV_API}/robot-report/dashboard/all-statuses`
    );
    return res.data;
  } catch {
    // Mock fallback until backend implements the endpoint
    return {
      running: 0,
      stopped: 2,
      terminating: 0,
      idle: 2,
      robots: [],
      triggerTypeCounts: { manual: 3, schedule: 2, 'event-gmail': 1 },
    };
  }
};
const robotReportApi = {
  getRobotLogDetail,
  getReportOverall,
  getReportAverageTime,
  getReportGroupPassed,
  getReportGroupError,
  getReportDetailFailures,
  getDashboardJobsHistory,
  getDashboardTransactions,
  getAllRobotStatuses,
};

export default robotReportApi;
