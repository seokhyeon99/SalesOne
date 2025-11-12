# Product API Documentation

## Overview
The Product API provides endpoints for managing products in the SalesOne platform. It allows listing, creating, retrieving, updating, and deleting products, as well as toggling their active status.

## Base URL
All product endpoints are prefixed with `/api/products/`.

## Authentication
All endpoints require authentication:
- List and retrieve actions require a regular authenticated user
- Create, update, delete, and toggle actions require admin user permissions

## Data Model

### Product
- `id` (UUID): Primary key
- `name` (String): Product name
- `plan_type` (String): Subscription type (one of: one_time, weekly, monthly)
- `plan_type_display` (String, read-only): Human-readable plan type
- `price` (Decimal): Product price (must be positive)
- `currency` (String): Currency code (one of: krw, usd, eur, jpy)
- `currency_display` (String, read-only): Human-readable currency
- `description` (Text): Detailed product description
- `is_active` (Boolean): Whether the product is currently active
- `created_by` (UUID, read-only): ID of the user who created the product
- `created_by_username` (String, read-only): Username of the user who created the product
- `created_at` (DateTime, read-only): Creation timestamp
- `updated_at` (DateTime, read-only): Last update timestamp

## Endpoints

### List Products
- **URL**: `/api/products/`
- **Method**: `GET`
- **Auth Required**: Yes (any authenticated user)
- **Description**: Returns a paginated list of all products
- **Query Parameters**:
  - `name`: Filter by product name (partial match)
  - `min_price`: Filter by minimum price
  - `max_price`: Filter by maximum price
  - `plan_type`: Filter by plan type
  - `currency`: Filter by currency
  - `is_active`: Filter by active status
  - `search`: Search in name and description fields
  - `ordering`: Order results (e.g., `name`, `-price`, `created_at`)
- **Response**: List of product objects

### Create Product
- **URL**: `/api/products/`
- **Method**: `POST`
- **Auth Required**: Yes (admin users only)
- **Description**: Creates a new product
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "plan_type": "monthly",
    "price": "10000.00",
    "currency": "krw",
    "description": "Product description",
    "is_active": true
  }
  ```
- **Notes**: 
  - Price must be positive
  - Created_by is automatically set to the requesting user
- **Response**: Created product object

### Retrieve Product
- **URL**: `/api/products/{id}/`
- **Method**: `GET`
- **Auth Required**: Yes (any authenticated user)
- **Description**: Returns details of a specific product
- **URL Parameters**:
  - `id`: Product UUID
- **Response**: Product object

### Update Product
- **URL**: `/api/products/{id}/`
- **Method**: `PUT`, `PATCH`
- **Auth Required**: Yes (admin users only)
- **Description**: Updates a product (full or partial update)
- **URL Parameters**:
  - `id`: Product UUID
- **Request Body**: Full or partial product object
- **Response**: Updated product object

### Delete Product
- **URL**: `/api/products/{id}/`
- **Method**: `DELETE`
- **Auth Required**: Yes (admin users only)
- **Description**: Deletes a product
- **URL Parameters**:
  - `id`: Product UUID
- **Response**: 204 No Content

### Toggle Active Status
- **URL**: `/api/products/{id}/toggle_active/`
- **Method**: `PATCH`
- **Auth Required**: Yes (admin users only)
- **Description**: Toggles the is_active status of a product
- **URL Parameters**:
  - `id`: Product UUID
- **Response**: Updated product object

### List Active Products
- **URL**: `/api/products/active/`
- **Method**: `GET`
- **Auth Required**: Yes (any authenticated user)
- **Description**: Returns a paginated list of only active products
- **Query Parameters**: Same as List Products endpoint
- **Response**: List of active product objects

# Workflow API Documentation

## Overview
The Workflow API provides endpoints for managing workflows and their executions in the SalesOne platform. It allows creating, retrieving, updating and deleting workflows, as well as executing workflows and managing their executions.

## Base URL
All workflow endpoints are prefixed with `/api/workflows/`.

## Authentication
All endpoints require authentication with a valid user account.

## Data Models

### Workflow
- `id` (UUID): Primary key
- `name` (String): Workflow name
- `description` (Text): Optional description of the workflow
- `nodes` (JSON): JSON object defining the workflow nodes
- `edges` (JSON): JSON object defining connections between nodes
- `is_active` (Boolean): Whether the workflow is currently active
- `is_template` (Boolean): Whether this workflow is a template
- `user` (UUID): ID of the user who owns the workflow
- `created_at` (DateTime, read-only): Creation timestamp
- `updated_at` (DateTime, read-only): Last update timestamp

### WorkflowExecution
- `id` (UUID): Primary key
- `workflow` (UUID): Reference to the parent workflow
- `task` (UUID, optional): Associated task, if any
- `status` (String): Current execution status ('pending', 'running', 'completed', 'failed', 'cancelled')
- `input_data` (JSON): Input data for the workflow execution
- `output_data` (JSON): Output data from the workflow execution
- `error_message` (Text): Error message if execution failed
- `started_at` (DateTime): When execution started
- `completed_at` (DateTime): When execution completed
- `created_at` (DateTime, read-only): Creation timestamp
- `updated_at` (DateTime, read-only): Last update timestamp

### WorkflowSchedule
- `id` (UUID): Primary key
- `name` (String): Name of the schedule
- `workflow` (UUID): Reference to the workflow to execute
- `is_active` (Boolean): Whether the schedule is active
- `frequency` (String): Execution frequency ('hourly', 'daily', 'weekly', 'monthly', 'custom')
- `cron_expression` (String, optional): Cron expression for custom schedules
- `run_at_hour` (Integer, optional): Hour to run (0-23) for daily, weekly, monthly schedules
- `run_at_minute` (Integer, optional): Minute to run (0-59) for daily, weekly, monthly schedules
- `run_on_days` (JSON array, optional): Days to run on for weekly schedules (0=Monday, 6=Sunday)
- `run_on_day_of_month` (Integer, optional): Day of month to run on (1-31) for monthly schedules
- `input_data` (JSON): Input data to pass to workflow executions
- `last_run` (DateTime, read-only): When the schedule last ran
- `next_run` (DateTime, read-only): When the schedule will next run
- `created_at` (DateTime, read-only): Creation timestamp
- `updated_at` (DateTime, read-only): Last update timestamp

## Key Endpoints

For a complete list of workflow-related endpoints and detailed examples, see [workflow-api-endpoints.md](workflow-api-endpoints.md).

### Workflow Management

- `GET /api/workflows/` - List workflows
- `POST /api/workflows/` - Create a new workflow
- `GET /api/workflows/{id}/` - Get workflow details
- `PATCH /api/workflows/{id}/` - Update a workflow
- `DELETE /api/workflows/{id}/` - Delete a workflow
- `GET /api/workflows/templates/` - List workflow templates
- `GET /api/workflows/node_types/` - Get available node types

### Workflow Execution

- `POST /api/workflows/{id}/execute/` - Execute a workflow asynchronously
- `POST /api/workflows/{id}/execute_directly/` - Execute a workflow synchronously
- `POST /api/workflows/{id}/validate/` - Validate a workflow without executing
- `GET /api/executions/` - List workflow executions
- `GET /api/executions/{id}/` - Get execution details
- `POST /api/executions/{id}/cancel/` - Cancel a workflow execution
- `GET /api/executions/{id}/execution_state/` - Get detailed execution state

### Workflow Scheduling

- `GET /api/schedules/` - List workflow schedules
- `POST /api/schedules/` - Create a new schedule
- `GET /api/schedules/{id}/` - Get schedule details
- `PATCH /api/schedules/{id}/` - Update a schedule
- `DELETE /api/schedules/{id}/` - Delete a schedule
- `POST /api/schedules/{id}/toggle_active/` - Toggle schedule active status
- `POST /api/schedules/{id}/update_next_run/` - Force recalculation of next run
