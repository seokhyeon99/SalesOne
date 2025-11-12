# Workflow API Documentation

This document provides detailed documentation for all workflow-related endpoints in the SalesOne API, including request/response examples and parameter descriptions.

## Base URL
All workflow endpoints are prefixed with `/api/workflows/`.

## Authentication
All endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## Workflow Management Endpoints

### List Workflows
`GET /api/workflows/`

Lists all workflows accessible to the authenticated user.

**Query Parameters:**
- `page` (integer, optional): Page number for pagination
- `page_size` (integer, optional): Number of items per page
- `search` (string, optional): Search term to filter workflows by name or description
- `is_template` (boolean, optional): Filter by template status
- `is_active` (boolean, optional): Filter by active status
- `ordering` (string, optional): Field to order by (e.g., '-created_at' for newest first)

**Response Example:**
```json
{
    "count": 25,
    "next": "http://api.salesone.com/api/workflows/?page=2",
    "previous": null,
    "results": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Lead Processing Workflow",
            "description": "Processes new leads and assigns them to sales reps",
            "nodes": {
                "node_1": {
                    "id": "node_1",
                    "type": "trigger",
                    "position": {"x": 100, "y": 100},
                    "data": {"trigger_type": "new_lead"}
                },
                "node_2": {
                    "id": "node_2",
                    "type": "assign_lead",
                    "position": {"x": 300, "y": 100},
                    "data": {"assignment_method": "round_robin"}
                }
            },
            "edges": [
                {
                    "source": "node_1",
                    "target": "node_2",
                    "id": "edge_1"
                }
            ],
            "is_active": true,
            "is_template": false,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

### Create Workflow
`POST /api/workflows/`

Creates a new workflow.

**Request Body:**
```json
{
    "name": "New Lead Processing",
    "description": "Automated lead processing workflow",
    "nodes": {
        "node_1": {
            "id": "node_1",
            "type": "trigger",
            "position": {"x": 100, "y": 100},
            "data": {"trigger_type": "new_lead"}
        },
        "node_2": {
            "id": "node_2",
            "type": "assign_lead",
            "position": {"x": 300, "y": 100},
            "data": {"assignment_method": "round_robin"}
        }
    },
    "edges": [
        {
            "source": "node_1",
            "target": "node_2",
            "id": "edge_1"
        }
    ],
    "is_active": true,
    "is_template": false
}
```

**Response:** Returns the created workflow object with status 201.

### Get Workflow Details
`GET /api/workflows/{id}/`

Retrieves detailed information about a specific workflow.

**Response Example:**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Lead Processing Workflow",
    "description": "Processes new leads and assigns them to sales reps",
    "nodes": {
        "node_1": {
            "id": "node_1",
            "type": "trigger",
            "position": {"x": 100, "y": 100},
            "data": {"trigger_type": "new_lead"}
        },
        "node_2": {
            "id": "node_2",
            "type": "assign_lead",
            "position": {"x": 300, "y": 100},
            "data": {"assignment_method": "round_robin"}
        }
    },
    "edges": [
        {
            "source": "node_1",
            "target": "node_2",
            "id": "edge_1"
        }
    ],
    "is_active": true,
    "is_template": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "execution_count": 15,
    "last_execution": "2024-01-15T15:45:00Z"
}
```

### Update Workflow
`PATCH /api/workflows/{id}/`

Updates specific fields of a workflow.

**Request Body Example:**
```json
{
    "name": "Updated Lead Processing",
    "is_active": false
}
```

**Response:** Returns the updated workflow object.

### Delete Workflow
`DELETE /api/workflows/{id}/`

Deletes a workflow. Returns 204 No Content on success.

## Workflow Execution Endpoints

### Execute Workflow
`POST /api/workflows/{id}/execute/`

Executes a workflow asynchronously.

**Request Body Example:**
```json
{
    "input_data": {
        "lead_id": "123e4567-e89b-12d3-a456-426614174000",
        "priority": "high"
    }
}
```

**Response Example:**
```json
{
    "execution_id": "987fcdeb-51a2-4bc1-9638-123456789012",
    "status": "pending",
    "started_at": "2024-01-15T16:00:00Z",
    "input_data": {
        "lead_id": "123e4567-e89b-12d3-a456-426614174000",
        "priority": "high"
    }
}
```

### Execute Workflow Directly
`POST /api/workflows/{id}/execute_directly/`

Executes a workflow synchronously and waits for completion.

**Request Body Example:**
```json
{
    "input_data": {
        "lead_id": "123e4567-e89b-12d3-a456-426614174000",
        "priority": "high"
    }
}
```

**Response Example:**
```json
{
    "execution_id": "987fcdeb-51a2-4bc1-9638-123456789012",
    "status": "completed",
    "started_at": "2024-01-15T16:00:00Z",
    "completed_at": "2024-01-15T16:00:05Z",
    "input_data": {
        "lead_id": "123e4567-e89b-12d3-a456-426614174000",
        "priority": "high"
    },
    "output_data": {
        "assigned_to": "789abcde-f012-3456-7890-123456789012",
        "assignment_time": "2024-01-15T16:00:03Z"
    }
}
```

### Validate Workflow
`POST /api/workflows/{id}/validate/`

Validates a workflow configuration without executing it.

**Request Body Example:**
```json
{
    "nodes": {
        "node_1": {
            "id": "node_1",
            "type": "trigger",
            "position": {"x": 100, "y": 100},
            "data": {"trigger_type": "new_lead"}
        },
        "node_2": {
            "id": "node_2",
            "type": "assign_lead",
            "position": {"x": 300, "y": 100},
            "data": {"assignment_method": "round_robin"}
        }
    },
    "edges": [
        {
            "source": "node_1",
            "target": "node_2",
            "id": "edge_1"
        }
    ]
}
```

**Response Example:**
```json
{
    "is_valid": true,
    "validation_messages": []
}
```

## Workflow Execution Management

### List Executions
`GET /api/executions/`

Lists workflow executions.

**Query Parameters:**
- `workflow` (UUID, optional): Filter by workflow ID
- `status` (string, optional): Filter by status
- `page` (integer, optional): Page number
- `page_size` (integer, optional): Items per page

**Response Example:**
```json
{
    "count": 50,
    "next": "http://api.salesone.com/api/executions/?page=2",
    "previous": null,
    "results": [
        {
            "id": "987fcdeb-51a2-4bc1-9638-123456789012",
            "workflow": "550e8400-e29b-41d4-a716-446655440000",
            "status": "completed",
            "started_at": "2024-01-15T16:00:00Z",
            "completed_at": "2024-01-15T16:00:05Z",
            "input_data": {
                "lead_id": "123e4567-e89b-12d3-a456-426614174000"
            },
            "output_data": {
                "assigned_to": "789abcde-f012-3456-7890-123456789012"
            }
        }
    ]
}
```

### Get Execution Details
`GET /api/executions/{id}/`

Gets detailed information about a specific execution.

**Response Example:**
```json
{
    "id": "987fcdeb-51a2-4bc1-9638-123456789012",
    "workflow": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "started_at": "2024-01-15T16:00:00Z",
    "completed_at": "2024-01-15T16:00:05Z",
    "input_data": {
        "lead_id": "123e4567-e89b-12d3-a456-426614174000"
    },
    "output_data": {
        "assigned_to": "789abcde-f012-3456-7890-123456789012"
    },
    "error_message": null,
    "node_states": {
        "node_1": {
            "status": "completed",
            "started_at": "2024-01-15T16:00:01Z",
            "completed_at": "2024-01-15T16:00:02Z",
            "output": {"event_data": {"lead_id": "123e4567-e89b-12d3-a456-426614174000"}}
        },
        "node_2": {
            "status": "completed",
            "started_at": "2024-01-15T16:00:03Z",
            "completed_at": "2024-01-15T16:00:04Z",
            "output": {"assigned_to": "789abcde-f012-3456-7890-123456789012"}
        }
    }
}
```

### Cancel Execution
`POST /api/executions/{id}/cancel/`

Cancels a running workflow execution.

**Response Example:**
```json
{
    "id": "987fcdeb-51a2-4bc1-9638-123456789012",
    "status": "cancelled",
    "cancelled_at": "2024-01-15T16:01:00Z"
}
```

## Workflow Scheduling Endpoints

### List Schedules
`GET /api/schedules/`

Lists workflow schedules.

**Query Parameters:**
- `workflow` (UUID, optional): Filter by workflow ID
- `is_active` (boolean, optional): Filter by active status
- `page` (integer, optional): Page number
- `page_size` (integer, optional): Items per page

**Response Example:**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "abcdef12-3456-7890-abcd-123456789012",
            "name": "Daily Lead Processing",
            "workflow": "550e8400-e29b-41d4-a716-446655440000",
            "is_active": true,
            "frequency": "daily",
            "run_at_hour": 9,
            "run_at_minute": 0,
            "input_data": {},
            "last_run": "2024-01-15T09:00:00Z",
            "next_run": "2024-01-16T09:00:00Z"
        }
    ]
}
```

### Create Schedule
`POST /api/schedules/`

Creates a new workflow schedule.

**Request Body Example:**
```json
{
    "name": "Daily Lead Processing",
    "workflow": "550e8400-e29b-41d4-a716-446655440000",
    "frequency": "daily",
    "run_at_hour": 9,
    "run_at_minute": 0,
    "input_data": {}
}
```

**Response:** Returns the created schedule object.

### Update Schedule
`PATCH /api/schedules/{id}/`

Updates a workflow schedule.

**Request Body Example:**
```json
{
    "is_active": false,
    "run_at_hour": 10
}
```

**Response:** Returns the updated schedule object.

### Toggle Schedule Active Status
`POST /api/schedules/{id}/toggle_active/`

Toggles the active status of a schedule.

**Response Example:**
```json
{
    "id": "abcdef12-3456-7890-abcd-123456789012",
    "is_active": false,
    "next_run": null
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "error": "validation_error",
    "detail": "Invalid workflow configuration",
    "validation_errors": {
        "field_name": ["Error message"]
    }
}
```

### 401 Unauthorized
```json
{
    "error": "unauthorized",
    "detail": "Authentication credentials were not provided"
}
```

### 403 Forbidden
```json
{
    "error": "permission_denied",
    "detail": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
    "error": "not_found",
    "detail": "Requested resource was not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "internal_server_error",
    "detail": "An unexpected error occurred"
}
``` 