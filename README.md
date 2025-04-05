# Network App - Application & Network Tracker

A web application for tracking professional networking contacts and job applications built with Next.js, TypeScript, Tailwind CSS, Shadcn UI, and Supabase.

## Features

- **Authentication System**: Secure email and password authentication with Supabase
- **Dashboard**: Overview of recent network contacts and active applications
- **Network Tracker**: Manage and track professional connections
- **Application Portal**: Track job applications, statuses, and credentials

## Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Database & Authentication**: Supabase

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Supabase project:
   - Create a new project on [Supabase](https://supabase.io)
   - Set up the following tables in your Supabase database:
   
   **Network Contacts Table**:
   ```sql
   CREATE TABLE network_contacts (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     status TEXT NOT NULL,
     company TEXT,
     role TEXT,
     linkedin_profile TEXT,
     location TEXT,
     date_of_first_contact TEXT,
     second_contact TEXT,
     notes TEXT,
     action_items TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Add RLS policies
   ALTER TABLE network_contacts ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view their own contacts" ON network_contacts
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own contacts" ON network_contacts
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own contacts" ON network_contacts
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own contacts" ON network_contacts
     FOR DELETE USING (auth.uid() = user_id);
   ```

   **Applications Table**:
   ```sql
   CREATE TABLE applications (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     company TEXT NOT NULL,
     link TEXT,
     active_apps BOOLEAN DEFAULT true,
     status TEXT NOT NULL,
     username TEXT,
     password TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Add RLS policies
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view their own applications" ON applications
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own applications" ON applications
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own applications" ON applications
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own applications" ON applications
     FOR DELETE USING (auth.uid() = user_id);
   ```

4. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This app can be easily deployed on Vercel:

1. Push to your GitHub repository
2. Connect to Vercel
3. Set the environment variables
4. Deploy

## License

MIT
