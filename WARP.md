# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a multi-component Slack application for random name/item selection with three main parts:
- **Slack App** (`slack app/`): Node.js Slack Bolt app for the core functionality
- **Website** (`website/`): React frontend with Slack OAuth integration and marketing site
- **CMS** (`cms/`): Sanity headless CMS for content management

The project uses AWS serverless architecture with DynamoDB for data storage.

## Development Commands

### Root Level (Monorepo)
```bash
# Install all workspace dependencies
npm install
```

### Slack App (`slack app/`)
```bash
# Development
npm start                    # Start with .env.dev file
npm run debug               # Start with debugging and serverless offline

# Testing
npm test                    # Run all tests with Mocha
npm run test:coverage       # Run tests with coverage report

# Deployment
npm run deploy              # Deploy to dev stage
npm run deploy:prod         # Deploy to production
```

### Website (`website/`)
```bash
# Development
npm run dev                 # Start full dev environment (API + web)
npm run api                 # Start only serverless API
npm run web                 # Start only Vite dev server

# Building & Testing
npm run build               # TypeScript compile + Vite build
npm run typecheck           # TypeScript type checking
npm run lint                # ESLint code quality check
npm run preview             # Preview built app locally

# Deployment
npm run deploy              # Build and deploy to dev
npm run deploy:prod         # Build and deploy to production
```

### CMS (`cms/`)
```bash
# Development
npm run dev                 # Start Sanity studio in dev mode
npm run start               # Start Sanity studio

# Building & Deployment
npm run build               # Build Sanity studio
npm run build:local         # Build with prompts
npm run deploy              # Deploy studio to Sanity
npm run deploy-graphql      # Deploy GraphQL API
```

## Architecture

### Slack App Architecture
- **Entry Point**: `app.js` - Sets up Slack Bolt app with Express receiver
- **Core Logic**: `name-draw-app.js` - Main `NameDrawApp` class handling all Slack interactions
- **Data Layer**: `installationStore.js` - DynamoDB integration for Slack installations
- **Analytics**: `analytics.js` - PostHog integration for usage tracking
- **Usage Management**: `usageTracker.js` - Handles usage limits and billing logic

### Website Architecture
- **Frontend**: React with React Router v7 for client-side routing
- **Styling**: Tailwind CSS with PostCSS
- **API**: Serverless Lambda functions in `api/` directory
- **Authentication**: Slack OAuth with DynamoDB session storage
- **Development**: HTTPS-enabled local development with mkcert certificates

### Data Flow
1. Users interact with Slack app via slash commands (`/drawnames`) or shortcuts
2. App shows modal for user/manual input selection
3. Random selection performed and posted to chosen Slack channel
4. Usage tracked in DynamoDB with analytics sent to PostHog
5. Website provides marketing, authentication, and account management

## Testing Strategy

### Slack App Testing
- Unit tests with Mocha, Chai, Sinon, and esmock for ES modules
- Test files located in `test/unit/` and `test/integration/`
- Coverage reports generated with c8

### Local Development Setup

#### HTTPS Certificates (Website)
The website requires HTTPS certificates for local development:

1. Install mkcert: `brew install mkcert` (macOS) or download for Windows
2. Install local CA: `mkcert -install`
3. Generate certificates: `mkcert localhost`
4. Copy files: `copy localhost.pem cert.pem && copy localhost-key.pem key.pem`
5. Add `cert.pem` and `key.pem` to `.gitignore`

#### Environment Variables
- Create `.env.dev` files in respective directories
- Required variables include Slack credentials, AWS config, and PostHog keys
- See `.env.example` files for templates

## Deployment Architecture

### Serverless Framework
All components use Serverless Framework for AWS deployment:
- **Stages**: `local`, `dev`, `prod`
- **Region**: `eu-west-2` (London)
- **Services**: Lambda functions, DynamoDB tables, S3 buckets, CloudFront

### Database Tables
- **Installations**: Stores Slack app installations and team data
- **Sessions**: Website session storage with secure HTTP-only cookies
- **Accounts**: User account and usage tracking data

## Key Integrations

- **Slack Bolt Framework**: For Slack app interactions and OAuth
- **AWS SDK**: DynamoDB operations and AWS services
- **PostHog**: Analytics and usage tracking
- **Sanity**: Headless CMS for marketing content
- **React Router v7**: Client-side routing
- **Vite**: Fast development and building
