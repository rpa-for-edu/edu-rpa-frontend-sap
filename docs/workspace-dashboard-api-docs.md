# Workspace Dashboard API Documentation

API endpoints required for the Workspace Dashboard screen.
These are workspace-scoped equivalents of the personnel dashboard endpoints documented in `dashboard-api-docs.md`.

---

## 1. Get Workspace Robot Statuses (Aggregated)

Returns aggregated counts of robot statuses across all robots in the specified workspace.

### Request

```
GET /dashboard/:workspaceId/all-statuses
Authorization: Bearer <access_token>
```

| Param         | Type   | Required | Description          |
|---------------|--------|----------|----------------------|
| `workspaceId` | string | Yes      | Workspace identifier |

### Response

```json
{
  "running": 2,
  "stopped": 3,
  "terminating": 0,
  "idle": 5,
  "robots": [
    {
      "name": "Invoice Bot",
      "processId": "proc-123",
      "processVersion": 1,
      "triggerType": "schedule",
      "scope": "workspace",
      "status": "running"
    }
  ],
  "triggerTypeCounts": {
    "manual": 4,
    "schedule": 3,
    "event-gmail": 1
  }
}
```

| Field               | Type                    | Description                                    |
|---------------------|-------------------------|------------------------------------------------|
| `running`           | number                  | Robots currently running                       |
| `stopped`           | number                  | Robots that are stopped                        |
| `terminating`       | number                  | Robots being terminated                        |
| `idle`              | number                  | Robots in idle state                           |
| `robots`            | RobotStatusItem[]       | List of individual robot statuses              |
| `triggerTypeCounts`  | Record<string, number> | Count of robots grouped by trigger type        |

### Implementation Notes

- Query robots scoped to the given workspace
- Only count the latest state per robot
- Filter by workspace ownership, not user ownership

---

## 2. Get Workspace Dashboard Jobs History

Returns pass/fail/stopped counts aggregated across all robots in the workspace.

### Request

```
GET /dashboard/:workspaceId/jobs-history?date=<ISO_DATE>
Authorization: Bearer <access_token>
```

| Param         | Type   | Required | Description                                          |
|---------------|--------|----------|------------------------------------------------------|
| `workspaceId` | string | Yes      | Workspace identifier                                 |
| `date`        | string | No       | ISO date string to filter from (e.g., `2025-11-23T04:00:00Z`) |

### Response

```json
{
  "successful": 8,
  "faulted": 3,
  "stopped": 1,
  "total": 12
}
```

| Field        | Type   | Description                                        |
|--------------|--------|----------------------------------------------------|
| `successful` | number | Executions where `passed > 0 AND failed = 0`       |
| `faulted`    | number | Executions where `failed > 0`                      |
| `stopped`    | number | Executions that were stopped                       |
| `total`      | number | Total execution count                              |

### Implementation Notes

- Query `robot_run_overall` filtered by workspace robots
- Apply optional date filter on `created_date`

---

## 3. Get Workspace Dashboard Transactions Timeline

Returns time-series transaction data across all workspace robots for charting.

### Request

```
GET /dashboard/:workspaceId/transactions?date=<ISO_DATE>&granularity=<GRANULARITY>
Authorization: Bearer <access_token>
```

| Param         | Type   | Required | Description                                                    |
|---------------|--------|----------|----------------------------------------------------------------|
| `workspaceId` | string | Yes      | Workspace identifier                                           |
| `date`        | string | No       | ISO date to filter from                                        |
| `granularity` | string | No       | Time bucket size: `minute`, `hour`, or `day`. Default: `hour`  |

### Granularity Guide

| Time Range    | Granularity | Label Format  |
|---------------|-------------|---------------|
| Last hour     | `minute`    | `HH:mm`       |
| Last day      | `hour`      | `HH:00`       |
| Last week     | `day`       | `YYYY-MM-DD`  |
| Last 30 days  | `day`       | `YYYY-MM-DD`  |

### Response

```json
{
  "labels": ["04:00", "05:00", "06:00", "07:00", "08:00"],
  "data": [0, 1, 3, 2, 1],
  "total": 7
}
```

| Field    | Type     | Description                               |
|----------|----------|-------------------------------------------|
| `labels` | string[] | Time bucket labels for x-axis             |
| `data`   | number[] | Count of transactions per time bucket     |
| `total`  | number   | Total transaction count in the period     |

### Implementation Notes

- Query `robot_run_overall` filtered by workspace robots and date range
- Group by time buckets based on granularity parameter
