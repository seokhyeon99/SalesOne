# SalesOne Frontend

A comprehensive Sales Engagement Platform (SEP) frontend built with Next.js.

## Technology Stack

- **Framework**: Next.js
- **UI Components**: ShadCN UI
- **Styling**: TailwindCSS
- **State Management**: React Context API + SWR for data fetching
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Workflow Builder**: React Flow
- **Email Template Builder**: React Email Editor (Unlayer)

## Project Structure

```
/app
├── (auth)                     # Authentication routes
├── (dashboard)                # Main app routes (protected)
│   ├── products               # Products management
│   ├── leads                  # Lead management
│   ├── campaigns              # Campaign management
│   ├── opportunities          # Opportunity management
│   ├── clients                # Client management
│   ├── tasks                  # Task management
│   └── workflows              # Workflow builder
```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/salesone-frontend.git
   cd salesone-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Deployment

The application is set up for easy deployment on Vercel.

## License

[MIT](LICENSE) 