# SalesOne Frontend Specification

## Overview
SalesOne is a comprehensive Sales Engagement Platform (SEP) designed to streamline the entire sales process, from lead management to customer relationship management and workflow automation.

## Technology Stack
- **Framework**: Next.js
- **UI Components**: ShadCN UI
- **Styling**: TailwindCSS
- **State Management**: React Context API + SWR for data fetching
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Workflow Builder**: React Flow (https://reactflow.dev)
- **Email Template Builder**: React Email Editor (Unlayer)

## Design Philosophy
SalesOne adopts a Notion-inspired design approach characterized by:

- **Clean, minimal interfaces** with generous whitespace
- **Block-based content structure** that's flexible and intuitive
- **Contextual controls** that appear only when needed
- **Smooth animations and transitions** for a polished feel
- **Consistent iconography and typography** for clear visual hierarchy
- **Seamless inline editing** without mode switching
- **Nested navigation and collapsible sections** for complex hierarchies
- **Keyboard shortcuts** for power users
- **Neutral color palette** with targeted accent colors for actions and status indicators
- **Responsive layouts** that adapt gracefully across devices

## Project Structure

```
/app
├── (auth)                     # Authentication routes
│   ├── login                  # Login page
│   ├── register               # Registration page
│   └── forgot-password        # Password recovery
├── (dashboard)                # Main app routes (protected)
│   ├── layout.tsx             # Dashboard layout with sidebar
│   ├── page.tsx               # Dashboard overview
│   ├── products               # Products management
│   │   ├── page.tsx           # Products list
│   │   ├── [id]               # Product details
│   │   └── new                # Create new product
│   ├── leads                  # Lead management
│   │   ├── page.tsx           # Lead lists overview
│   │   ├── [id]               # Lead list details
│   │   ├── new                # Create new lead list
│   │   └── managed            # SalesOne lead database
│   ├── campaigns              # Campaign management
│   │   ├── page.tsx           # Campaigns list
│   │   ├── [id]               # Campaign details
│   │   ├── new                # Create new campaign
│   │   └── templates          # Email templates
│   ├── opportunities          # Opportunity management
│   │   ├── page.tsx           # Kanban board view
│   │   └── [id]               # Opportunity details
│   ├── clients                # Client management
│   │   ├── page.tsx           # Clients list
│   │   └── [id]               # Client details with tabs
│   ├── tasks                  # Task management
│   │   ├── page.tsx           # Kanban board view
│   │   └── [id]               # Task details
│   └── workflows              # Workflow builder
│       ├── page.tsx           # Workflows list
│       ├── [id]               # Workflow editor
│       └── templates          # Pre-built workflows
└── middlewares                # API request handling and authentication
    └── api-rewrite.ts         # Rewrites for API requests to backend
```

## API Integration
All API requests will be routed through Next.js rewrites to the Django backend:

```typescript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend-server/api/:path*', // Will be configured per environment
      },
    ];
  },
};
```

## Components Structure

```
/components
├── ui                         # ShadCN UI components
│   ├── button.tsx
│   ├── dropdown.tsx
│   ├── card.tsx
│   ├── ... (other shadcn components)
├── layout                     # Layout components
│   ├── sidebar.tsx            # Main navigation sidebar
│   ├── header.tsx             # Dashboard header
│   └── page-header.tsx        # Page title and actions
├── data-display               # Data presentation components
│   ├── data-table.tsx         # Reusable data table
│   ├── kanban-board.tsx       # Drag and drop kanban
│   └── timeline.tsx           # Activity timeline
├── forms                      # Form components
│   ├── product-form.tsx       # Product create/edit form
│   ├── lead-form.tsx          # Lead create/edit form
│   ├── campaign-form.tsx      # Campaign create/edit form
│   ├── opportunity-form.tsx   # Opportunity create/edit form
│   ├── client-form.tsx        # Client create/edit form
│   ├── task-form.tsx          # Task create/edit form
│   └── workflow-form.tsx      # Workflow configuration form
├── email-builder              # Email template builder components
│   ├── editor.tsx             # Integration with Unlayer React Email Editor
│   ├── variables-picker.tsx   # Dynamic variables selector
│   └── preview.tsx            # Email preview
└── workflow-builder           # Node-based workflow builder using React Flow
    ├── canvas.tsx             # React Flow canvas wrapper
    ├── custom-nodes/          # Custom node components
    │   ├── email-node.tsx     # Email sending node
    │   ├── slack-node.tsx     # Slack notification node
    │   ├── webhook-node.tsx   # Webhook node
    │   ├── condition-node.tsx # Conditional logic node
    │   └── delay-node.tsx     # Time delay node
    ├── panel.tsx              # Node selection panel
    └── controls.tsx           # Workflow controls
```

## Key Features

### Authentication and Authorization
- User registration, login, and password recovery
- Role-based access control for team collaboration

### Products Management
- Create, view, edit, and delete products
- Set pricing plans and product details
- Link products to clients for billing automation

### Lead Management
- Import leads from external sources
- Search and filter SalesOne lead database
- Create custom lead lists for targeted campaigns

### Campaign Management
- Create personalized email campaigns
- Email template builder with Unlayer React Email Editor
- Campaign performance tracking and analytics
- LLM-enhanced personalization

### Opportunity Management
- Kanban board for lead progression
- Automated data enrichment for lead insights
- Conversion tracking and sales pipeline visualization

### Client Management
- Comprehensive client profile with activity timeline
- Note-taking, file attachments, and task assignments
- Email communication history

### Task Management
- Kanban board for task organization
- Task assignment and due date tracking
- Workflow-linked task automation

### Workflow Builder
- Drag-and-drop node-based workflow editor using React Flow
- Pre-built nodes for common actions:
  - Send email
  - Send Slack notification
  - Update CRM
  - Create task
  - Conditional logic
  - Time delays
  - Webhooks
- Visual workflow designer with node connections
- Workflow testing and simulation

## UI/UX Principles
- Clean, intuitive interface inspired by Notion
- Responsive design for all device sizes
- Consistent design language using ShadCN components
- Progressive disclosure to manage complex functionality
- Context-aware help and tooltips
- Inline editing without mode switching
- Smooth transitions and animations

## Development Approach
- Component-driven development using Storybook
- Atomic design principles for component organization
- Server components for improved performance
- API route handlers for backend communication
- Optimistic UI updates for better user experience

## Performance Considerations
- Image optimization using Next.js Image component
- Code splitting and lazy loading for faster load times
- Server-side rendering for SEO and initial load performance
- Edge caching for frequently accessed data

## Accessibility
- ARIA attributes for screen reader compatibility
- Keyboard navigation support
- Color contrast compliance with WCAG standards
- Focus management for improved keyboard usability 