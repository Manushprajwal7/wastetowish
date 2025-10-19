# Supabase Setup Guide

This guide will help you set up Supabase as an alternative backend for the add-item functionality.

## Prerequisites

1. A Supabase account (free tier available at https://supabase.com/)
2. A Supabase project created

## Setup Steps

### 1. Create a Supabase Project

1. Go to https://supabase.com/ and sign up or log in
2. Create a new project
3. Note down your project URL and anon key from the project settings

### 2. Set up Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create the Database Schema

Run the SQL script located at `scripts/supabase-schema.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/supabase-schema.sql`
4. Run the script

This will:

- Drop any existing items table and policies
- Create a new `items` table with all necessary fields (owner_id as text to match Firebase user IDs)
- Add indexes for better query performance
- Set up Row Level Security (RLS) policies that allow all authenticated users to insert items
- Grant appropriate permissions

### 4. Set up Storage

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `item-images`
4. Set the bucket to public access (or configure appropriate policies)

### 5. Configure Storage Policies

In the Storage section, for the `item-images` bucket, set up the following policies:

1. For SELECT: `Allow all users to view images`
2. For INSERT: `Allow authenticated users to upload images`

To set these policies manually:

1. Go to your Supabase project dashboard
2. Navigate to Storage → Policies
3. Find the `item-images` bucket
4. Click "Add Policy" and create the following policies:

**SELECT Policy:**

- Name: `Allow public read access`
- For: `SELECT`
- To: `anon, authenticated`
- Using: `bucket_id = 'item-images'`

**INSERT Policy:**

- Name: `Allow authenticated insert access`
- For: `INSERT`
- To: `authenticated`
- With Check: `bucket_id = 'item-images'`

### 6. Update Application Pages

The application now uses Supabase for the following pages:

- `/dashboard` - Displays user's donated items and stats
- `/marketplace` - Displays all items from the community
- `/my-items` - Displays only the current user's items
- `/item/[id]` - Displays details for a specific item
- `/add-item` - Creates new items in Supabase

## Testing the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the `/add-item` page
3. Try adding an item with an image
4. Check the Supabase dashboard to verify the item was created
5. Navigate to `/dashboard` to see your items
6. Navigate to `/marketplace` to see all items

## Troubleshooting

### Common Issues

1. **Authentication Error**: Make sure you're logged in to the application
2. **Storage Access Denied**: Check that your storage bucket policies are correctly configured
3. **Database Connection Error**: Verify your Supabase URL and anon key are correct
4. **Row Level Security Policy Violation**: The schema now uses permissive RLS policies for item creation
5. **Policy Already Exists**: The updated script now drops existing policies before creating new ones
6. **Image Not Uploading**: Check browser console for detailed error messages

### Debugging Steps

1. Check the browser console for detailed error messages
2. Verify environment variables are correctly set
3. Check the Supabase dashboard for any error logs
4. Ensure the database schema matches the expected structure
5. Verify storage bucket policies are correctly configured
6. Use the `/test-storage` page to test direct Supabase storage operations

### Storage Bucket Troubleshooting

If images are not uploading or displaying:

1. **Verify Bucket Exists**: Check that the `item-images` bucket exists in your Supabase Storage
2. **Check Bucket Policies**: Ensure both SELECT and INSERT policies are correctly configured
3. **Test with /test-storage**: Use the test page to verify direct storage operations work
4. **Check Public Access**: Make sure the bucket allows public read access for images
5. **Verify File URLs**: Check that generated URLs are correct and accessible

### Production Considerations

For a production environment, you should consider:

1. Restricting update/delete operations to only the item owners
2. Adding additional validation and sanitization
3. Implementing proper error handling and user feedback
4. Setting up proper authentication with Supabase Auth if migrating from Firebase

## Support

If you continue to have issues:

1. Check the Supabase documentation: https://supabase.com/docs
2. Verify your project settings in the Supabase dashboard
3. Ensure all dependencies are installed (`@supabase/supabase-js`)
4. Check the browser console for specific error messages
