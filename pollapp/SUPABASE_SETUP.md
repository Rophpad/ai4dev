# Supabase Setup Guide for PollApp

This guide will walk you through setting up Supabase as the backend for your PollApp project.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed locally

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: PollApp (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project"
5. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (optional, for server-side operations)

## Step 3: Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase-schema.sql` from your project root
4. Paste it into the SQL editor
5. Click **Run** to execute the schema

This will create:
- `profiles` table for user profiles
- `polls` table for poll data
- `poll_options` table for poll choices
- `votes` table for tracking votes
- `poll_participants` table for participation tracking
- Row Level Security (RLS) policies
- Necessary functions and triggers

## Step 5: Set Up Storage for Avatars

1. In your Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Enter bucket name: `avatars`
4. Make sure **Public bucket** is enabled
5. Click **Create bucket**

### Storage Policies (Optional)

If you need custom storage policies, run this in the SQL Editor:

```sql
-- Allow public access to avatar images
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Configure Authentication

1. Go to **Authentication** > **Settings**
2. Configure your site URL:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### Enable Email Confirmations (Recommended)

1. Go to **Authentication** > **Settings**
2. Under **User Signups**, enable **Enable email confirmations**
3. Customize email templates in **Authentication** > **Templates**

### Configure Email Templates (Optional)

You can customize the email templates for:
- Confirm signup
- Reset password
- Change email address

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Try to register a new account
4. Check your email for confirmation (if enabled)
5. Test login functionality

## Step 8: Production Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Update Site URL

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Update the **Site URL** to your production domain
3. Add your production callback URLs

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**
   - Check that your environment variables are correct
   - Make sure you're using the `anon` key, not the `service_role` key for client-side

2. **RLS policies blocking requests**
   - Check the PostgreSQL logs in your Supabase dashboard
   - Verify that your RLS policies are correctly configured

3. **Schema errors**
   - Make sure you ran the complete schema from `supabase-schema.sql`
   - Check for any SQL errors in the SQL Editor

4. **Storage upload issues**
   - Verify the avatars bucket is created and public
   - Check storage policies are correctly applied

### Debugging Tools

1. **Supabase Logs**: Check real-time logs in your dashboard
2. **PostgreSQL Logs**: View database query logs
3. **Network Tab**: Check API requests in browser dev tools
4. **Console Errors**: Look for JavaScript errors related to Supabase

## Additional Configuration

### Real-time Features (Optional)

To enable real-time updates for polls:

```sql
-- Enable real-time for polls table
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

### Custom Functions (Optional)

The schema includes several helper functions:
- `can_user_vote()` - Check if a user can vote on a poll
- `get_poll_results()` - Get formatted poll results with statistics
- `update_poll_option_votes()` - Automatically update vote counts

## Security Best Practices

1. **Never expose service_role key** on the client side
2. **Use RLS policies** to secure your data
3. **Validate user input** before database operations
4. **Use prepared statements** to prevent SQL injection
5. **Regularly audit your policies** and permissions

## Next Steps

Once Supabase is set up:

1. Implement the poll creation API
2. Add real-time vote updates
3. Create user dashboard with analytics
4. Add email notifications
5. Implement poll sharing features

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)

---

**Need Help?**
- Check the [Supabase Discord](https://discord.supabase.com)
- Review the [GitHub Issues](https://github.com/supabase/supabase/issues)
- Post questions in the [Supabase Community](https://github.com/supabase/supabase/discussions)