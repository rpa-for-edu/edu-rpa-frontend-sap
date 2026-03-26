# Admin Dashboard API Documentation

API endpoints for the Admin System Dashboard. All endpoints require **admin role** authorization.
These endpoints aggregate data across **all users** in the system (not scoped to the current user).

---

## 1. Get System-wide Process Count

```
GET /admin/dashboard/processes/count
Authorization: Bearer <access_token>
```

### Response

```json
24
```

Returns the total number of processes across all users.

### Implementation Notes

- Query `processes` table: `SELECT COUNT(*) FROM processes`
- Must verify `user.role === 'admin'` via guard/middleware

---

## 2. Get System-wide Robot Count

```
GET /admin/dashboard/robots/count
Authorization: Bearer <access_token>
```

### Response

```json
18
```

Returns the total number of robots across all users.

### Implementation Notes

- Query `robots` table: `SELECT COUNT(*) FROM robots`

---

## 3. Get System-wide Workspace Count

```
GET /admin/dashboard/workspaces/count
Authorization: Bearer <access_token>
```

### Response

```json
6
```

Returns the total number of workspaces.

### Implementation Notes

- Query `workspaces` table: `SELECT COUNT(*) FROM workspaces`

---

## 4. Get System-wide User Count

```
GET /admin/dashboard/users/count
Authorization: Bearer <access_token>
```

### Response

```json
12
```

Returns the total number of registered users.

### Implementation Notes

- Query `users` table: `SELECT COUNT(*) FROM users`

---

## 5. Get System-wide Robot Statuses (Aggregated)

```
GET /admin/dashboard/all-statuses
Authorization: Bearer <access_token>
```

### Response

```json
{
  "running": 3,
  "stopped": 5,
  "terminating": 0,
  "idle": 10,
  "robots": [
    {
      "name": "Invoice Robot",
      "processId": "proc-001",
      "processVersion": 1,
      "triggerType": "manual",
      "scope": "user@example.com",
      "status": "running"
    }
  ],
  "triggerTypeCounts": {
    "manual": 8,
    "schedule": 6,
    "event-gmail": 4
  }
}
```

| Field               | Type                    | Description                           |
|---------------------|-------------------------|---------------------------------------|
| `running`           | number                  | Robots currently running              |
| `stopped`           | number                  | Robots that are stopped               |
| `terminating`       | number                  | Robots being terminated               |
| `idle`              | number                  | Robots in idle state                  |
| `robots`            | RobotStatusItem[]       | List of individual robot statuses     |
| `triggerTypeCounts`  | Record<string, number> | Count of robots grouped by trigger    |

### Implementation Notes

- Same logic as `GET /robot-report/dashboard/all-statuses` but **without** `user_id` filter
- Aggregate across all users' robots

---

## 6. Get System-wide Jobs History

```
GET /admin/dashboard/jobs-history?date=<ISO_DATE>
Authorization: Bearer <access_token>
```

| Param  | Type   | Required | Description                           |
|--------|--------|----------|---------------------------------------|
| `date` | string | No       | ISO date to filter from               |

### Response

```json
{
  "successful": 15,
  "faulted": 4,
  "stopped": 1,
  "total": 20
}
```

| Field        | Type   | Description                                        |
|--------------|--------|----------------------------------------------------|
| `successful` | number | Executions where `passed > 0 AND failed = 0`       |
| `faulted`    | number | Executions where `failed > 0`                      |
| `stopped`    | number | Executions that were stopped                       |
| `total`      | number | Total executions                                   |

### Implementation Notes

- Same logic as `GET /robot-report/dashboard/jobs-history` but **without** `user_id` filter
- Query `robot_run_overall` table across all users

---

## 7. Get System-wide Transactions Timeline

```
GET /admin/dashboard/transactions?date=<ISO_DATE>&granularity=<GRANULARITY>
Authorization: Bearer <access_token>
```

| Param         | Type   | Required | Description                                   |
|---------------|--------|----------|-----------------------------------------------|
| `date`        | string | No       | ISO date to filter from                       |
| `granularity` | string | No       | `minute`, `hour`, or `day`. Default: `hour`   |

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
  "data": [2, 5, 8, 3, 4],
  "total": 22
}
```

| Field    | Type     | Description                               |
|----------|----------|-------------------------------------------|
| `labels` | string[] | Time bucket labels for x-axis             |
| `data`   | number[] | Transaction count per time bucket         |
| `total`  | number   | Total transaction count                   |

### Implementation Notes

- Same logic as `GET /robot-report/dashboard/transactions` but **without** `user_id` filter
- Group by time buckets across all users' robots
