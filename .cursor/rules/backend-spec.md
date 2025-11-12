# SalesOne Backend Specification

## Overview
The SalesOne backend provides a robust API and data management system to support the Sales Engagement Platform. It handles data storage, business logic, authentication, and integration with external services.

## Technology Stack
- **Framework**: Django
- **API**: Django Rest Framework
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Queue**: Celery
- **Search Engine**: PostgreSQL Full-Text Search
- **Authentication**: JWT
- **Email Delivery**: SendGrid/Mailgun with tracking
- **Workflow Engine**: Custom execution engine with pluggable actions

## Project Structure

```
/salesone                       # Main project directory
├── salesone/                   # Project settings
│   ├── __init__.py
│   ├── settings/               # Split settings
│   │   ├── __init__.py
│   │   ├── base.py             # Base settings
│   │   ├── development.py      # Development settings
│   │   └── production.py       # Production settings
│   ├── urls.py                 # Main URL configuration
│   ├── wsgi.py                 # WSGI configuration
│   └── asgi.py                 # ASGI configuration
├── apps/                       # Django applications
│   ├── accounts/               # User authentication and profiles
│   │   ├── models.py           # User model
│   │   ├── serializers.py      # User serializers
│   │   ├── views.py            # User views
│   │   └── urls.py             # User URLs
│   ├── products/               # Product management
│   │   ├── models.py           # Product model
│   │   ├── serializers.py      # Product serializers
│   │   ├── views.py            # Product views
│   │   └── urls.py             # Product URLs
│   ├── leads/                  # Lead management
│   │   ├── models.py           # Lead and LeadList models
│   │   ├── serializers.py      # Lead serializers
│   │   ├── views.py            # Lead views
│   │   └── urls.py             # Lead URLs
│   ├── campaigns/              # Campaign management
│   │   ├── models.py           # Campaign models
│   │   ├── serializers.py      # Campaign serializers
│   │   ├── views.py            # Campaign views
│   │   ├── tasks.py            # Celery tasks for campaigns
│   │   ├── email_sender.py     # Email sending functionality
│   │   ├── tracking.py         # Email tracking handlers
│   │   └── urls.py             # Campaign URLs
│   ├── opportunities/          # Opportunity management
│   │   ├── models.py           # Opportunity model
│   │   ├── serializers.py      # Opportunity serializers
│   │   ├── views.py            # Opportunity views
│   │   └── urls.py             # Opportunity URLs
│   ├── clients/                # Client management
│   │   ├── models.py           # Client model
│   │   ├── serializers.py      # Client serializers
│   │   ├── views.py            # Client views
│   │   └── urls.py             # Client URLs
│   ├── tasks/                  # Task management
│   │   ├── models.py           # Task model
│   │   ├── serializers.py      # Task serializers
│   │   ├── views.py            # Task views
│   │   ├── tasks.py            # Celery tasks
│   │   └── urls.py             # Task URLs
│   └── workflows/              # Workflow management
│       ├── models.py           # Workflow models
│       ├── serializers.py      # Workflow serializers
│       ├── views.py            # Workflow views
│       ├── engine/             # Workflow execution engine
│       │   ├── __init__.py
│       │   ├── executor.py     # Main workflow executor
│       │   ├── context.py      # Workflow execution context
│       │   └── registry.py     # Node type registry
│       ├── nodes/              # Built-in workflow node types
│       │   ├── __init__.py
│       │   ├── base.py         # Base node class
│       │   ├── email.py        # Email sending node
│       │   ├── slack.py        # Slack notification node
│       │   ├── webhook.py      # Webhook node
│       │   ├── condition.py    # Conditional logic node
│       │   └── delay.py        # Time delay node
│       ├── tasks.py            # Celery tasks for workflows
│       └── urls.py             # Workflow URLs
├── common/                     # Shared utilities
│   ├── models.py               # Base models
│   ├── serializers.py          # Base serializers
│   ├── views.py                # Base views
│   └── utils.py                # Utility functions
├── services/                   # External service integrations
│   ├── email/                  # Email delivery services
│   │   ├── __init__.py
│   │   ├── sendgrid.py         # SendGrid integration
│   │   ├── mailgun.py          # Mailgun integration
│   │   └── tracking.py         # Email tracking handlers
│   └── slack/                  # Slack integration
│       ├── __init__.py
│       └── client.py           # Slack API client
└── celery_app.py               # Celery configuration
```

## Database Schema

### User
- `id`: UUID
- `email`: Email field
- `password`: Hashed password
- `first_name`: String
- `last_name`: String
- `is_active`: Boolean
- `is_staff`: Boolean
- `date_joined`: DateTime
- `last_login`: DateTime

### Product
- `id`: UUID
- `name`: String - e.g., "네이버 검색 CPC 광고"
- `plan_type`: Choice - e.g., "일반결제", "매주결제", "매월결제"
- `price`: Decimal
- `currency`: String - e.g., "krw"
- `description`: Text
- `created_at`: DateTime
- `updated_at`: DateTime
- `created_by`: ForeignKey(User)

### Industry
- `code`: CharField(max_length=20, unique=True) - e.g., "S96113"
- `name`: CharField(max_length=200) - e.g., "피부 미용업"

### Keyword
- `name`: CharField(max_length=100, unique=True)
- `created_at`: DateTimeField(auto_now_add=True)

### SalesOneLead (UltimateDB - Global Lead Database)
- `corporation_number`: CharField(max_length=13, unique=True) - e.g., "1101112955908"
- `business_number`: CharField(max_length=10, null=True) - e.g., "2068188409"
- `industry`: ForeignKey(Industry, on_delete=models.SET_NULL, null=True)
- `industry_name`: CharField(max_length=200, null=True)
- `name`: CharField(max_length=200) - e.g., "주식회사 넥스파시스템"
- `name_eng`: CharField(max_length=200, null=True)
- `owner`: CharField(max_length=100, null=True) - e.g., "서종렬"
- `email`: EmailField(null=True) - e.g., "shym0518@nexpa.co.kr"
- `phone`: CharField(max_length=20, null=True) - e.g., "02-2243-4011"
- `homepage`: JSONField(null=True) - e.g., ["repurehc.com"]
- `handle_goods`: JSONField(null=True)
- `employee`: IntegerField(default=1) - e.g., 11
- `finance_currency_code`: CharField(max_length=5, null=True)
- `finance_year`: IntegerField(null=True)
- `finance_revenue`: BigIntegerField(null=True) - e.g., 10589738000
- `finance_operating_profit`: BigIntegerField(null=True)
- `finance_comprehensive_income`: BigIntegerField(null=True)
- `finance_net_profit`: BigIntegerField(null=True)
- `finance_total_assets`: BigIntegerField(null=True)
- `finance_total_liabilities`: BigIntegerField(null=True)
- `finance_total_equity`: BigIntegerField(null=True)
- `finance_capital`: BigIntegerField(null=True)
- `finance_debt_ratio`: DecimalField(max_digits=10, decimal_places=2, null=True)
- `is_normal_taxpayer`: BooleanField(default=False)
- `is_corporation`: BooleanField(default=False)
- `address`: TextField(null=True) - e.g., "서울특별시 금천구 가산디지털1로 25 (가산동, 대륭테크노타운17차) 1806호~1809호"
- `si_nm`: CharField(max_length=50, null=True) - e.g., "서울특별시"
- `sgg_nm`: CharField(max_length=50, null=True) - e.g., "금천구"
- `postal_code`: CharField(max_length=6, null=True)
- `established_date`: DateField(null=True) - e.g., "2003-10-17"
- `description`: TextField(null=True)
- `keywords`: ManyToManyField(Keyword, related_name='ultimatedb', blank=True)
- `scraped_bizinfo`: BooleanField(default=False)

### Lead (User's Leads)
- `id`: UUID
- `corporation_number`: Char - e.g., "1101111713381"
- `business_number`: Char - e.g., "1188120723"
- `name`: Text - e.g., "(주)대우캐리어판매"
- `owner`: Text - e.g., "이경남"
- `email`: EmailField - e.g., "dcc2000@korea.com"
- `phone`: Char - e.g., "02-849-7976"
- `homepage`: JSONField - e.g., ["airconhouse.co.kr"]
- `employee`: Integer - e.g., 16
- `revenue`: BigInteger - e.g., 21857000000
- `address`: Text - e.g., "서울특별시 영등포구 도신로 148 (신길동)"
- `si_nm`: Char - e.g., "서울특별시"
- `sgg_nm`: Char - e.g., "영등포구"
- `established_date`: Date - e.g., "1999-06-12"
- `industry`: ForeignKey(Industry)
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### LeadList
- `id`: UUID
- `name`: String
- `description`: Text
- `lead_ids`: ArrayField(UUID) - References to Lead
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### Campaign
- `id`: UUID
- `name`: String - e.g., "건강기능식품류 월매출 5억 이상 법인 캠페인"
- `leadlists`: ManyToManyField(LeadList)
- `template`: ForeignKey(CampaignTemplate)
- `user`: ForeignKey(User)
- `status`: Choice - e.g., "draft", "scheduled", "in_progress", "completed", "failed"
- `scheduled_at`: DateTime (optional)
- `started_at`: DateTime (optional)
- `completed_at`: DateTime (optional)
- `created_at`: DateTime
- `updated_at`: DateTime

### CampaignTemplate
- `id`: UUID
- `name`: String - e.g., "건기식 템플랫"
- `title`: String - e.g., "안녕하세요 {{company.owner}} 대표님!"
- `body`: Text - HTML content with variables
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### CampaignLeadResult
- `id`: UUID
- `campaign`: ForeignKey(Campaign)
- `lead`: ForeignKey(Lead)
- `title`: String - e.g., "안녕하세요 강윤구 대표님"
- `data`: JSONField - e.g., `{"llm-generation": "쿠팡에서 대표님께서 판매중인 임산부 유산균 상품을 보던 중..."}`
- `status`: Choice - e.g., "pending", "sent", "opened", "clicked", "replied", "bounced", "failed"
- `sent`: Boolean
- `sent_at`: DateTime (optional)
- `opened_at`: DateTime (optional)
- `clicked_at`: DateTime (optional)
- `replied_at`: DateTime (optional)
- `created_at`: DateTime
- `updated_at`: DateTime

### Opportunity
- `id`: UUID
- `name`: String
- `source`: String - e.g., "website", "campaign", "referral"
- `status`: Choice - e.g., "new", "qualified", "proposal", "negotiation", "won", "lost"
- `value`: Decimal (optional)
- `expected_close_date`: Date (optional)
- `notes`: Text
- `lead`: ForeignKey(Lead) (optional)
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### Client
- `id`: UUID
- `name`: String - e.g., "제로커뮤니케이션(주)"
- `representative_name`: String - e.g., "유창해"
- `emails`: JSONField - e.g., ["admin@zerocommunication.co.kr"]
- `phones`: JSONField - e.g., ["010-2451-3612"]
- `address`: Text - e.g., "경기도 고양시 덕양구 통일로 140"
- `website`: String - e.g., "zerocommunication.co.kr"
- `business_number`: String (optional)
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### ClientNote
- `id`: UUID
- `client`: ForeignKey(Client)
- `title`: String
- `content`: Text
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### ClientFile
- `id`: UUID
- `client`: ForeignKey(Client)
- `file`: FileField
- `name`: String
- `description`: Text
- `user`: ForeignKey(User)
- `created_at`: DateTime

### Task
- `id`: UUID
- `name`: String - e.g., "세금계산서 발행"
- `body`: Text - e.g., "제로커뮤니케이션 3월 세금계산서 발행"
- `workflow_ids`: ArrayField (optional) - References to Workflow
- `workflow_data`: JSONField (optional)
- `due_date`: Date - e.g., "2025-04-13"
- `assignee`: ForeignKey(User)
- `status`: Choice - e.g., "not_started", "in_progress", "completed", "failed"
- `client`: ForeignKey(Client) (optional)
- `created_by`: ForeignKey(User)
- `is_repetitive`: Boolean
- `repetition_interval`: Integer (optional) - Days between repetitions
- `repetition_end_date`: Date (optional)
- `created_at`: DateTime
- `updated_at`: DateTime

### Workflow
- `id`: UUID
- `name`: String
- `description`: Text
- `nodes`: JSONField - Stores the workflow nodes configuration
- `edges`: JSONField - Stores the connections between nodes
- `is_active`: Boolean
- `is_template`: Boolean
- `user`: ForeignKey(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### WorkflowExecution
- `id`: UUID
- `workflow`: ForeignKey(Workflow)
- `task`: ForeignKey(Task) (optional)
- `status`: Choice - e.g., "pending", "running", "completed", "failed"
- `input_data`: JSONField
- `output_data`: JSONField
- `error_message`: Text (optional)
- `started_at`: DateTime
- `completed_at`: DateTime (optional)
- `created_at`: DateTime

## API Endpoints

### Authentication
- `POST /api/auth/registration/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - Logout and blacklist token
- `GET /api/auth/me/` - Get current user profile
- `PUT /api/auth/me/` - Update user profile

### Products
- `GET /api/products/` - List all products
- `POST /api/products/` - Create a new product
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product

### Leads
- `GET /api/leads/` - List all leads
- `POST /api/leads/` - Create a new lead
- `GET /api/leads/{id}/` - Get lead details
- `PUT /api/leads/{id}/` - Update lead
- `DELETE /api/leads/{id}/` - Delete lead
- `GET /api/salesone-leads/` - Search SalesOne leads database
- `POST /api/salesone-leads/import/` - Import leads from SalesOne to user's leads

### Lead Lists
- `GET /api/lead-lists/` - List all lead lists
- `POST /api/lead-lists/` - Create a new lead list
- `GET /api/lead-lists/{id}/` - Get lead list details
- `PUT /api/lead-lists/{id}/` - Update lead list
- `DELETE /api/lead-lists/{id}/` - Delete lead list
- `POST /api/lead-lists/{id}/add-leads/` - Add leads to lead list
- `POST /api/lead-lists/{id}/remove-leads/` - Remove leads from lead list

### Campaigns
- `GET /api/campaigns/` - List all campaigns
- `POST /api/campaigns/` - Create a new campaign
- `GET /api/campaigns/{id}/` - Get campaign details
- `PUT /api/campaigns/{id}/` - Update campaign
- `DELETE /api/campaigns/{id}/` - Delete campaign
- `POST /api/campaigns/{id}/start/` - Start campaign
- `POST /api/campaigns/{id}/pause/` - Pause campaign
- `GET /api/campaigns/{id}/results/` - Get campaign results

### Campaign Templates
- `GET /api/campaign-templates/` - List all campaign templates
- `POST /api/campaign-templates/` - Create a new campaign template
- `GET /api/campaign-templates/{id}/` - Get campaign template details
- `PUT /api/campaign-templates/{id}/` - Update campaign template
- `DELETE /api/campaign-templates/{id}/` - Delete campaign template
- `POST /api/campaign-templates/{id}/preview/` - Preview campaign template with test data

### Opportunities
- `GET /api/opportunities/` - List all opportunities
- `POST /api/opportunities/` - Create a new opportunity
- `GET /api/opportunities/{id}/` - Get opportunity details
- `PUT /api/opportunities/{id}/` - Update opportunity
- `DELETE /api/opportunities/{id}/` - Delete opportunity
- `POST /api/opportunities/{id}/change-status/` - Change opportunity status

### Clients

#### List Clients
- `GET /api/clients/clients/`
- Lists all clients for the authenticated user with pagination
- Response example:
```json
{
  "count": 2,
  "next": "http://api.example.com/clients/clients/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "제로커뮤니케이션(주)",
      "representative_name": "유창해",
      "emails": ["admin@zerocommunication.co.kr"],
      "phones": ["010-2451-3612"],
      "address": "경기도 고양시 덕양구 통일로 140",
      "website": "zerocommunication.co.kr",
      "business_number": "123-45-67890",
      "created_at": "2024-03-20T09:00:00Z",
      "updated_at": "2024-03-20T09:00:00Z"
    }
  ]
}
```

#### Create Client
- `POST /api/clients/clients/`
- Creates a new client
- Request example:
```json
{
  "name": "제로커뮤니케이션(주)",
  "representative_name": "유창해",
  "emails": ["admin@zerocommunication.co.kr"],
  "phones": ["010-2451-3612"],
  "address": "경기도 고양시 덕양구 통일로 140",
  "website": "zerocommunication.co.kr",
  "business_number": "123-45-67890"
}
```

#### Get Client Details
- `GET /api/clients/clients/{id}/`
- Retrieves detailed information about a specific client including notes and files
- Response example:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "제로커뮤니케이션(주)",
  "representative_name": "유창해",
  "emails": ["admin@zerocommunication.co.kr"],
  "phones": ["010-2451-3612"],
  "address": "경기도 고양시 덕양구 통일로 140",
  "website": "zerocommunication.co.kr",
  "business_number": "123-45-67890",
  "created_at": "2024-03-20T09:00:00Z",
  "updated_at": "2024-03-20T09:00:00Z",
  "notes": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "client": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Initial Meeting Notes",
      "content": "Met with CEO to discuss potential collaboration",
      "created_at": "2024-03-20T10:00:00Z",
      "user": "123e4567-e89b-12d3-a456-426614174000",
      "user_email": "sales@example.com"
    }
  ],
  "files": [
    {
      "id": "9c9e6679-7425-40de-944b-e07fc1f90ae7",
      "client": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Contract.pdf",
      "description": "Signed service agreement",
      "file_url": "http://example.com/media/clients/550e8400/files/Contract.pdf",
      "created_at": "2024-03-20T11:00:00Z",
      "user": "123e4567-e89b-12d3-a456-426614174000",
      "user_email": "sales@example.com"
    }
  ]
}
```

#### Update Client
- `PUT /api/clients/clients/{id}/`
- Updates client information
- Request example: Same as POST request

#### Delete Client
- `DELETE /api/clients/clients/{id}/`
- Deletes a client and all associated data

#### Get Client Timeline
- `GET /api/clients/clients/{id}/timeline/`
- Retrieves a chronological timeline of all client activities (notes and files)
- Response example:
```json
[
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "type": "note",
    "title": "Initial Meeting Notes",
    "content": "Met with CEO to discuss potential collaboration",
    "created_at": "2024-03-20T10:00:00Z",
    "created_by": "sales@example.com"
  },
  {
    "id": "9c9e6679-7425-40de-944b-e07fc1f90ae7",
    "type": "file",
    "name": "Contract.pdf",
    "description": "Signed service agreement",
    "file_url": "http://example.com/media/clients/550e8400/files/Contract.pdf",
    "created_at": "2024-03-20T11:00:00Z",
    "created_by": "sales@example.com"
  }
]
```

#### Get Client Emails
- `GET /api/clients/clients/{id}/emails/`
- Retrieves all emails associated with the client
- Response example:
```json
[
  {
    "id": "8c9e6679-7425-40de-944b-e07fc1f90ae7",
    "subject": "Meeting Follow-up",
    "from": "sales@example.com",
    "to": "client@example.com",
    "content": "Thank you for meeting with us today...",
    "created_at": "2024-03-20T15:00:00Z",
    "attachments": [
      {
        "id": "ac9e6679-7425-40de-944b-e07fc1f90ae7",
        "name": "proposal.pdf",
        "url": "http://example.com/media/emails/attachments/proposal.pdf",
        "size": 1024000,
        "type": "pdf"
      }
    ]
  }
]
```

#### List Client Notes
- `GET /api/clients/client-notes/`
- Lists all notes for all clients accessible to the user with pagination
- Response example:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "client": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Initial Meeting Notes",
      "content": "Met with CEO to discuss potential collaboration",
      "created_at": "2024-03-20T10:00:00Z",
      "updated_at": "2024-03-20T10:00:00Z",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "sales@example.com"
      }
    }
  ]
}
```

#### List Client Files
- `GET /api/clients/client-files/`
- Lists all files for all clients accessible to the user with pagination
- Response example:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "9c9e6679-7425-40de-944b-e07fc1f90ae7",
      "client": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Contract.pdf",
      "size": 1024000,
      "type": "pdf",
      "url": "http://example.com/media/clients/550e8400/files/Contract.pdf",
      "description": "Signed service agreement",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "sales@example.com"
      },
      "created_at": "2024-03-20T11:00:00Z"
    }
  ]
}
```

#### Upload Client File
- `POST /api/clients/client-files/`
- Uploads a new file for a client
- Request: Multipart form data
  - `client`: Client ID (UUID)
  - `file`: File to upload
  - `name`: File name (optional, defaults to uploaded file name)
  - `description`: File description (optional)

#### Additional Endpoints Needed (Based on Project Goals)

##### Get Client Insights
- `GET /api/clients/clients/{id}/insights/`
- Retrieves AI-generated insights about the client based on their data and interactions
- Response example:
```json
{
  "client_id": "550e8400-e29b-41d4-a716-446655440000",
  "insights": {
    "engagement_score": 85,
    "recent_activity_summary": "High engagement in last 30 days with 5 successful interactions",
    "recommendations": [
      "Consider upselling Product X based on recent purchases",
      "Schedule follow-up meeting to discuss new service launch"
    ],
    "key_metrics": {
      "total_revenue": 15000000,
      "active_products": 3,
      "last_interaction": "2024-03-20T09:00:00Z"
    }
  }
}
```

##### Get Client Products
- `GET /api/clients/clients/{id}/products/`
- Lists all products associated with the client
- Response example:
```json
{
  "active_products": [
    {
      "id": "450e8400-e29b-41d4-a716-446655440000",
      "name": "네이버 검색 CPC 광고",
      "plan_type": "매월결제",
      "price": 2500000,
      "currency": "krw",
      "start_date": "2024-01-01",
      "next_billing_date": "2024-04-01",
      "status": "active"
    }
  ],
  "past_products": [
    {
      "id": "350e8400-e29b-41d4-a716-446655440000",
      "name": "SNS 마케팅 패키지",
      "plan_type": "일반결제",
      "price": 1500000,
      "currency": "krw",
      "start_date": "2023-06-01",
      "end_date": "2023-12-31",
      "status": "completed"
    }
  ]
}
```

##### Get Client Communication History
- `GET /api/clients/clients/{id}/communications/`
- Retrieves all communication history with the client including emails, meetings, and calls
- Response example:
```json
{
  "communications": [
    {
      "type": "email",
      "direction": "outbound",
      "campaign_id": "150e8400-e29b-41d4-a716-446655440000",
      "subject": "신규 서비스 안내",
      "sent_at": "2024-03-15T09:00:00Z",
      "status": "opened",
      "opened_at": "2024-03-15T10:30:00Z"
    },
    {
      "type": "meeting",
      "title": "서비스 리뷰 미팅",
      "scheduled_at": "2024-03-20T14:00:00Z",
      "duration_minutes": 60,
      "status": "completed",
      "notes_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
    }
  ]
}
```

##### Get Client Tasks
- `GET /api/clients/clients/{id}/tasks/`
- Retrieves all tasks associated with the client, including workflow-bound tasks
- Response example:
```json
{
  "tasks": {
    "pending": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440000",
        "name": "세금계산서 발행",
        "body": "제로커뮤니케이션 3월 세금계산서 발행",
        "workflow_ids": ["750e8400-e29b-41d4-a716-446655440000"],
        "workflow_data": {
          "750e8400-e29b-41d4-a716-446655440000": {
            "product": 231,
            "amount": 123000,
            "currency": "krw",
            "company_name": "제로커뮤니케이션(주)",
            "receipt_reciever": "유창해",
            "business_number": "123-45-67890",
            "industry": "상품 종합 도매업"
          }
        },
        "due_date": "2024-04-13",
        "assignee": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "sales@example.com"
        },
        "status": "not-finished",
        "created_by": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "sales@example.com"
        },
        "created_at": "2024-03-20T09:00:00Z",
        "is_repetitive": true,
        "repetition_interval": 30,
        "repetition_end_date": "2024-12-31"
      }
    ],
    "in_progress": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "월간 리뷰 미팅",
        "body": "3월 성과 리뷰 및 4월 계획 논의",
        "workflow_ids": [],
        "due_date": "2024-03-25",
        "assignee": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "sales@example.com"
        },
        "status": "in-progress",
        "created_by": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "sales@example.com"
        },
        "created_at": "2024-03-15T09:00:00Z",
        "is_repetitive": false
      }
    ],
    "completed": [
      {
        "id": "670e8400-e29b-41d4-a716-446655440000",
        "name": "계약서 검토",
        "body": "신규 서비스 계약서 검토 및 서명",
        "workflow_ids": [],
        "due_date": "2024-03-10",
        "assignee": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "sales@example.com"
        },
        "status": "completed",
        "created_by": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "sales@example.com"
        },
        "created_at": "2024-03-05T09:00:00Z",
        "completed_at": "2024-03-10T15:30:00Z",
        "is_repetitive": false
      }
    ]
  },
  "summary": {
    "total_tasks": 3,
    "pending_tasks": 1,
    "in_progress_tasks": 1,
    "completed_tasks": 1,
    "workflow_bound_tasks": 1,
    "overdue_tasks": 0,
    "upcoming_tasks": 2
  }
}
```

The response includes:
- Tasks grouped by status (pending, in_progress, completed)
- For workflow-bound tasks:
  - Associated workflow IDs
  - Workflow-specific data
  - Execution status
- For repetitive tasks:
  - Repetition interval
  - End date
- Task summary statistics

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `POST /api/tasks/{id}/change-status/` - Change task status
- `POST /api/tasks/{id}/execute-workflow/` - Execute workflows linked to a task

### Workflows
- `GET /api/workflows/` - List all workflows
- `POST /api/workflows/` - Create a new workflow
- `GET /api/workflows/{id}/` - Get workflow details
- `PUT /api/workflows/{id}/` - Update workflow
- `DELETE /api/workflows/{id}/` - Delete workflow
- `POST /api/workflows/{id}/activate/` - Activate workflow
- `POST /api/workflows/{id}/deactivate/` - Deactivate workflow
- `POST /api/workflows/{id}/execute/` - Execute workflow with provided data
- `GET /api/workflows/templates/` - Get workflow templates

## Email Sending System

The email sending system handles all outbound email communications for the platform, including campaign emails, notifications, and transactional messages.

### Key Components:

1. **Email Service Provider Integration**
   - Integration with SendGrid and Mailgun APIs
   - Fallback mechanism between providers
   - Email delivery status tracking
   - Attachments and template support

2. **Email Templating**
   - HTML template rendering with variables
   - Responsive email design
   - Dynamic content insertion
   - LLM-powered personalization

3. **Email Tracking**
   - Open tracking via invisible pixel
   - Click tracking via URL rewriting
   - Bounce and complaint handling
   - Event webhooks processing

4. **Anti-Spam Measures**
   - SPF, DKIM, and DMARC configuration
   - Email warming strategies
   - Deliverability monitoring
   - Sending rate limiting

5. **Queue Management**
   - Prioritization of different email types
   - Retry logic for failed deliveries
   - Rate limiting to avoid provider throttling
   - Scheduling for optimal delivery times

### Implementation:

```python
# Example email sending task
@shared_task(bind=True, max_retries=3)
def send_campaign_email(self, campaign_id, lead_id, template_id, personalization_data):
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        lead = Lead.objects.get(id=lead_id)
        template = CampaignTemplate.objects.get(id=template_id)
        
        # Generate personalized content
        personalized_subject = personalize_template(template.title, lead, personalization_data)
        personalized_body = personalize_template(template.body, lead, personalization_data)
        
        # Add tracking parameters
        tracking_id = f"{campaign.id}:{lead.id}:{uuid.uuid4()}"
        tracked_body = add_tracking(personalized_body, tracking_id)
        
        # Send email through provider
        result = email_service.send(
            to=lead.email,
            subject=personalized_subject,
            html_content=tracked_body,
            tracking_data={
                'campaign_id': str(campaign.id),
                'lead_id': str(lead.id),
                'tracking_id': tracking_id
            }
        )
        
        # Record the result
        CampaignLeadResult.objects.create(
            campaign=campaign,
            lead=lead,
            title=personalized_subject,
            data=personalization_data,
            status='sent',
            sent=True,
            sent_at=timezone.now()
        )
        
        return result
        
    except (Campaign.DoesNotExist, Lead.DoesNotExist, CampaignTemplate.DoesNotExist) as e:
        logger.error(f"Entity not found: {str(e)}")
        raise self.retry(exc=e, countdown=60 * 5)  # Retry after 5 minutes
        
    except EmailDeliveryError as e:
        logger.error(f"Email delivery failed: {str(e)}")
        
        # Record the failure
        CampaignLeadResult.objects.create(
            campaign=campaign,
            lead=lead,
            title=personalized_subject,
            data=personalization_data,
            status='failed',
            sent=False,
            error_message=str(e)
        )
        
        raise self.retry(exc=e, countdown=60 * 15)  # Retry after 15 minutes
```

## Workflow Execution Engine

The workflow engine is a flexible system for defining and executing automated processes. It uses a node-based approach where each node represents a specific action or condition.

### Key Components:

1. **Node Registry**
   - Central registry of all available node types
   - Plugin architecture for extending with custom nodes
   - Node metadata including inputs, outputs, and configuration options

2. **Workflow Executor**
   - Executes workflows based on node graph
   - Manages data flow between nodes
   - Handles errors and retries
   - Supports parallel and conditional execution paths

3. **Execution Context**
   - Stores workflow state during execution
   - Provides access to workflow variables
   - Maintains execution logs
   - Handles timeouts and cancellation

4. **Built-in Node Types**
   - Email sending nodes
   - Slack notification nodes
   - Webhook nodes (inbound and outbound)
   - Delay nodes for time-based actions
   - Conditional logic nodes
   - Data transformation nodes
   - Task creation and management nodes

### Implementation:

```python
# Example workflow execution task
@shared_task(bind=True)
def execute_workflow(self, workflow_id, context_data=None, task_id=None):
    try:
        workflow = Workflow.objects.get(id=workflow_id)
        
        # Create execution record
        execution = WorkflowExecution.objects.create(
            workflow=workflow,
            task_id=task_id,
            status='running',
            input_data=context_data or {},
            started_at=timezone.now()
        )
        
        # Initialize execution context
        context = WorkflowContext(
            execution_id=execution.id,
            data=context_data or {},
            workflow=workflow
        )
        
        # Create workflow executor
        executor = WorkflowExecutor(workflow, context)
        
        # Execute the workflow
        result = executor.execute()
        
        # Update execution record
        execution.status = 'completed'
        execution.output_data = result
        execution.completed_at = timezone.now()
        execution.save()
        
        return result
        
    except Workflow.DoesNotExist as e:
        logger.error(f"Workflow not found: {str(e)}")
        raise
        
    except WorkflowExecutionError as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        
        # Update execution record
        if execution:
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = timezone.now()
            execution.save()
        
        # Retry if appropriate
        if e.is_retriable:
            raise self.retry(exc=e, countdown=60 * 5)
        else:
            raise
```

## Background Tasks (Celery)

### Email Campaigns
- Send campaign emails to leads
- Process email tracking events (opens, clicks)
- Schedule campaigns for future execution
- Retry failed email deliveries with exponential backoff
- Generate and send campaign reports

### Lead Enrichment
- Enrich lead data with additional information from external sources
- Update lead scores based on activity and engagement
- Perform periodic data validation and cleanup
- Generate lead insights using AI/ML processing

### Workflow Automation
- Execute workflow nodes in sequence
- Handle long-running processes
- Retry failed workflow tasks
- Process scheduled workflow executions
- Execute conditional paths based on triggers

### Task Management
- Create recurring tasks based on task configuration
- Send task notifications and reminders
- Execute workflow-linked tasks
- Auto-assign tasks based on workload balancing
- Generate task performance analytics

## Caching Strategy (Redis)
- Cache frequently accessed data (e.g., user profiles, lead lists)
- Store task queue and worker communication
- Implement rate limiting for API endpoints
- Cache email templates and campaign data
- Store session data and authentication tokens
- Track workflow execution state
- Implement pub/sub for real-time updates

## Security Considerations
- JWT-based authentication with short expiry
- Password hashing with Django's default hasher
- CSRF protection for authenticated endpoints
- Input validation and sanitization
- Permission-based access control
- Rate limiting to prevent abuse
- Sensitive data encryption
- Regular security audits
- GDPR compliance for lead data

## Testing Strategy
- Unit tests for models and business logic
- Integration tests for API endpoints
- Mock external services for testing
- Test coverage reporting
- End-to-end workflow testing
- Load testing for email sending capability
- Security vulnerability testing

## Deployment Considerations
- Docker containerization
- Environment-specific settings
- Database migration strategy
- Backup and disaster recovery plan
- Monitoring and logging setup
- Scalable architecture for high-volume email campaigns
- CI/CD pipeline for automated testing and deployment 