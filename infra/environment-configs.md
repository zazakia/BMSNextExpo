# Environment-Specific Configurations

This document outlines how to configure environment-specific settings for development, staging, and production environments.

## Development Environment

For local development, create a `.env.local` file in the root of the project with the following variables:

```bash
# Next.js Web App
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key

# Prisma Database Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/bms
DIRECT_URL=postgresql://postgres:password@localhost:5432/bms

# Mobile App
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
```

For running the local Supabase instance, use Docker with the provided `docker-compose.yml` file:

```bash
# Start local Supabase
docker-compose up -d
```

## Staging Environment

For the staging environment, use the Supabase staging project. Configure the following environment variables:

```bash
# Next.js Web App
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging-anon-key]

# Mobile App
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[staging-anon-key]
```

Configure Vercel for the staging environment:

```bash
# Connect to staging Vercel project
vercel link --scope=[org-id] --project=[project-id]

# Deploy to staging
vercel --prod
```

## Production Environment

For the production environment, use the Supabase production project. Configure the following environment variables:

```bash
# Next.js Web App
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]

# Mobile App
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]
```

Configure Vercel for the production environment:

```bash
# Connect to production Vercel project
vercel link --prod

# Deploy to production
vercel --prod
```

## CI/CD Pipeline Configuration

Configure the following secrets in your GitHub repository:

```
VERCEL_TOKEN=[vercel-token]
VERCEL_ORG_ID=[vercel-org-id]
VERCEL_PROJECT_ID=[vercel-project-id]
EXPO_TOKEN=[expo-token]
```

## Database Migrations

For each environment, run the appropriate database migrations:

```bash
# For development
cd packages/db
npx prisma generate
npx prisma db push

# For staging and production
npx prisma migrate deploy