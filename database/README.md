# Database Setup Guide

## Initial Setup

1. **Create Supabase Project**: Set up a new Supabase project
2. **Run Initial Schema**: Execute `schema.sql` in your Supabase SQL editor
3. **Apply Migrations**: Run migration files in order

## Migration Files

### 001_add_user_profile_fields.sql

Adds `age` and `occupation` fields to the users table.

### 002_fix_rls_policies.sql

Fixes Row Level Security policies to allow user registration.

## Environment Variables

Make sure your `.env.local` has valid Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

## Troubleshooting RLS Issues

If you encounter "row-level security policy" errors:

1. **Run Migration 002**: This fixes the RLS policies
2. **Check Service Role Key**: Ensure your service role key is correct
3. **Verify Policies**: Make sure the policies allow user creation

## Manual RLS Fix (if needed)

If migrations don't work, run this manually in Supabase SQL editor:

```sql
-- Allow service role to create users
CREATE POLICY "Enable insert for service role" ON users
FOR INSERT WITH CHECK (true);

-- Update existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id::text);
```

## Testing

### User Registration
1. Go to `/auth/signup`
2. Fill out the form
3. Should create user successfully

### User Login
1. Go to `/auth/signin`
2. Use the same credentials from signup
3. Should redirect to dashboard

### Troubleshooting Login Issues

If login fails after successful signup:

1. **Check Environment Variables**:
   - Ensure `NEXTAUTH_SECRET` is set to a proper value (not placeholder)
   - Verify Supabase credentials are correct

2. **Check Browser Console**:
   - Look for authentication debug logs
   - Check for any JavaScript errors

3. **Verify User in Database**:
   ```sql
   SELECT id, email, first_name, last_name FROM users WHERE email = 'your-email@example.com';
   ```

4. **Test Password Hash**:
   - Ensure bcrypt is working correctly
   - Password should be hashed in database

## Notes

- The application uses `supabaseAdmin` client for user management operations
- Regular `supabase` client is used for user-specific data operations
- RLS policies protect user data while allowing registration
- NextAuth uses JWT strategy for session management
- Debug mode is enabled in development for troubleshooting
