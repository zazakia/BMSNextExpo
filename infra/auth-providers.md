# Supabase Authentication Providers

## Email/Password Authentication

The default authentication method in Supabase is email/password. This is already configured in our Prisma schema and can be used immediately.

## Social Authentication (OAuth)

To enable social login with Google, GitHub, or other providers:

1. Go to the Supabase Dashboard
2. Navigate to Authentication > Settings > Providers
3. Enable the provider you want to use
4. Add your Client ID and Client Secret (obtained from the provider)
5. Configure the redirect URL in your Supabase project settings

## Magic Link Authentication

To enable passwordless authentication with email links:

1. Go to the Supabase Dashboard
2. Navigate to Authentication > Settings > Providers
3. Enable the Email provider
4. Enable "Email Confirmations" if you want users to confirm their email

## SMS Authentication

To enable phone number authentication:

1. Go to the Supabase Dashboard
2. Navigate to Authentication > Settings > Providers
3. Enable the Phone provider
4. Configure your SMS provider credentials (Twilio, MessageBird, etc.)

## Custom Authentication

For custom authentication flows, you can:

1. Use the Supabase Auth API directly
2. Implement custom JWT tokens
3. Use third-party authentication services

## Implementing User Roles

To implement user roles in Supabase:

1. Create a custom JWT claim for roles
2. Add this to the auth.users table metadata
3. Reference this claim in your RLS policies

Here's how to set this up in the frontend:

```typescript
// In your auth service
export const signUp = async (email: string, password: string, role: UserRole = 'STAFF') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role, // This will be stored in the user metadata
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
```

Then in your RLS policies, you can reference the role:

```sql
CREATE POLICY "Admins can view all data" ON "Product"
  FOR ALL TO authenticated USING (
    current_setting('request.jwt.claim.role', true) = 'ADMIN'
  );