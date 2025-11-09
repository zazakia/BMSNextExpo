# Supabase Project Configuration

## Initial Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note your project URL and anon key from the project settings
3. Set up the following services in your Supabase dashboard:
   - Authentication
   - Database
   - Storage
   - Edge Functions

## Environment Variables

Configure the following environment variables in your application:

### For Next.js Web App (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For Expo Mobile App
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For Prisma Database Connection
```
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

## Database Schema

The database schema is defined in `packages/db/prisma/schema.prisma`. To apply the schema to your Supabase database:

```bash
cd packages/db
npx prisma generate
npx prisma db push
```

## Authentication Providers

Supabase provides built-in authentication with email/password, but you can also set up additional providers:

1. Navigate to Authentication > Settings in your Supabase dashboard
2. Enable the desired providers (Google, GitHub, etc.)
3. Configure the provider credentials

## Row Level Security (RLS)

RLS policies are implemented in the database to ensure data security. The policies are defined in `infra/supabase-rls.sql`. To apply them:

1. Go to the SQL Editor in your Supabase dashboard
2. Run the SQL from `infra/supabase-rls.sql`

## Edge Functions

For server-side logic, Supabase Edge Functions can be used. These are defined in the `supabase/functions` directory. To deploy:

```bash
supabase functions deploy function-name
```

## Storage Buckets

For file storage, create the following buckets in your Supabase dashboard:

- `product-images` - For product images
- `documents` - For business documents
- `receipts` - For transaction receipts

## Realtime

To enable real-time updates in your application:

1. Configure Realtime in the Supabase dashboard
2. Set up replication for the necessary tables