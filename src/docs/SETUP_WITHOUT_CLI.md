# 🎨 Setup Guide for Figma Make (No CLI Required)

You're working in Figma Make environment without terminal access. Here's how to set everything up!

---

## ✅ Good News - Your Supabase is Already Configured!

I can see your credentials in `/utils/supabase/info.tsx`:
- ✅ **Project ID:** `aavqkdxlfulawhevutpn`
- ✅ **Anon Key:** Already set

**The frontend is ready to connect to Supabase!** 🎉

---

## 🗄️ Step 1: Setup Database (Required)

Since you can't run CLI commands, use **Supabase Dashboard**:

### 1.1 Go to Your Supabase Project

Open: https://supabase.com/dashboard/project/aavqkdxlfulawhevutpn

### 1.2 Run SQL Migrations

**Dashboard → SQL Editor → New Query**

Execute each migration file **in order** (copy-paste and click RUN):

#### Migration 1: Initial Schema
Copy contents from `/supabase/migrations/001_initial_schema.sql`

```sql
-- Creates test_history table
CREATE TABLE IF NOT EXISTS test_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_history_created_at ON test_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_history_type ON test_history(type);
```

Click **RUN** ✅

---

#### Migration 2: Add User ID
Copy contents from `/supabase/migrations/002_add_user_id_to_test_history.sql`

```sql
-- Adds user_id for multi-user support
ALTER TABLE test_history 
ADD COLUMN IF NOT EXISTS user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_test_history_user_id ON test_history(user_id);
```

Click **RUN** ✅

---

#### Migration 3: Enable Auth
Copy contents from `/supabase/migrations/003_enable_auth.sql`

```sql
-- Enable Row Level Security
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;

-- Users see only their own data
CREATE POLICY "Users can view own test history"
ON test_history FOR SELECT
USING (
  user_id = CAST(auth.uid() AS TEXT)
  OR user_id IS NULL
);

CREATE POLICY "Users can insert own test history"
ON test_history FOR INSERT
WITH CHECK (user_id = CAST(auth.uid() AS TEXT));

CREATE POLICY "Service role has full access"
ON test_history
USING (auth.jwt() ->> 'role' = 'service_role');
```

Click **RUN** ✅

---

#### Migration 4: Video Tutorials
Copy contents from `/supabase/migrations/004_video_tutorials.sql`

**Important:** This migration also creates Storage bucket. Execute it, but if you get an error about bucket creation, that's okay - we'll create it manually next.

Click **RUN** (ignore bucket errors if any)

---

### 1.3 Create Storage Bucket (if not created)

**Dashboard → Storage → New Bucket**

- **Name:** `tutorials`
- **Public:** ❌ No (keep private)
- Click **Create bucket**

---

### 1.4 Verify Tables Exist

**Dashboard → Table Editor**

You should see:
- ✅ `test_history`
- ✅ `tutorials`
- ✅ `user_video_progress`

**Dashboard → Storage**

You should see:
- ✅ `tutorials` bucket

---

## 👤 Step 2: Create Admin User (Optional)

**Dashboard → Authentication → Users → Add User**

Fill in:
- **Email:** `admin@test.local`
- **Password:** `Admin123!` (or your preferred password)
- **Auto Confirm User:** ✅ Check this

Click **Create User**

Now you can login as admin through the web interface! 🔐

---

## 🚀 Step 3: Deploy Edge Functions (Backend API)

You have **two options** without CLI:

### Option A: GitHub Integration (Recommended)

1. **Push your code to GitHub** (if not already)
   - Create a new repository on GitHub
   - Upload your project files

2. **Connect to Supabase:**
   - Dashboard → Edge Functions
   - Click "Deploy from GitHub"
   - Authorize GitHub
   - Select your repository
   - Select branch (main/master)
   - Function path: `supabase/functions/make-server-4c493c62`

3. **Set Secrets:**
   - Dashboard → Edge Functions → Secrets
   - Add secret: `OPENAI_API_KEY` = `your_openai_key` (if using AI features)

Now every push to GitHub will auto-deploy! 🎉

---

### Option B: Manual Deployment via Dashboard

Unfortunately, Supabase doesn't support direct file upload for Edge Functions through Dashboard.

**Alternative:** Use Supabase CLI on another machine (friend's computer, cloud IDE, etc.) just once to deploy, then use GitHub for updates.

---

### Option C: Use Online IDE (Temporary)

Use a free online IDE with terminal:

1. **GitHub Codespaces** (if you have GitHub)
   - Open your repo → Code → Codespaces → New
   - Terminal will be available

2. **Gitpod** (https://gitpod.io)
   - Free tier available
   - Open your repo URL: `https://gitpod.io/#https://github.com/yourname/yourrepo`

Then run:
```bash
npm install -g supabase
supabase login
supabase link --project-ref aavqkdxlfulawhevutpn
cd supabase/functions
supabase functions deploy make-server-4c493c62
```

**One-time deployment** - then use GitHub integration for updates!

---

## 🎥 Step 4: Upload Tutorial Videos (Optional)

If you want to use the video tutorial feature:

### 4.1 Upload Videos

**Dashboard → Storage → tutorials → Upload**

- Select your video files (mp4, webm)
- Upload them

### 4.2 Add Video Metadata

**Dashboard → Table Editor → tutorials → Insert Row**

Fill in:
- **title:** "Introduction to Kaizen"
- **description:** "Learn the basics"
- **duration:** 300 (seconds)
- **storage_path:** "intro.mp4" (filename you uploaded)
- **order_index:** 1

Repeat for each video!

---

## ✅ Step 5: Test Your App

### In Figma Make:

1. Click **Preview** or **Run**
2. The app should load
3. You'll see login form (since not in Telegram)
4. Login with admin credentials
5. Explore the app!

### Check What Works:

- ✅ **Profile page** - should show "Admin" badge
- ✅ **Test History** - loads (empty at first)
- ✅ **Tutorials** - shows videos if uploaded
- ✅ **Test Templates** - static data, works without backend

### What Needs Backend:

- ❌ **Creating tests** - needs Edge Functions deployed
- ❌ **Saving history** - needs Edge Functions deployed
- ❌ **AI features** - needs Edge Functions + OpenAI key

---

## 🔧 Configuration Files

### Current Setup:

**`/utils/supabase/info.tsx`** - Already configured! ✅
```typescript
export const projectId = "aavqkdxlfulawhevutpn"
export const publicAnonKey = "sb_secret_..." // Already set
```

**`/.env.local`** - Created for you (optional)
```env
VITE_SUPABASE_PROJECT_ID=aavqkdxlfulawhevutpn
VITE_SUPABASE_ANON_KEY=your_key
```

You can use either approach - hardcoded or .env!

---

## 🎯 What You Can Do Right Now:

### Without Edge Functions:

✅ **Login/Logout** - Auth works  
✅ **View Profile** - Shows user data from Telegram  
✅ **Browse Test Templates** - Static data  
✅ **Navigate** - All routes work  
✅ **Responsive Design** - Test on mobile  

### With Edge Functions Deployed:

✅ **Create Tests** - Full functionality  
✅ **Save History** - Persistent storage  
✅ **View History** - User-specific data  
✅ **Video Progress** - Track watching  
✅ **AI Features** - Generate reports  

---

## 📱 Testing in Telegram

To test as Telegram Mini App:

1. **Create a bot** with [@BotFather](https://t.me/BotFather)
2. **Set Mini App URL:**
   - Get your Figma Make preview URL
   - Or deploy to a public URL (Vercel, Netlify)
   - Use `/setmenubutton` command with BotFather
3. **Open bot** in Telegram
4. App loads with Telegram user data! 🎉

---

## 🐛 Troubleshooting

### "Failed to fetch" errors

- ✅ Check browser console (F12)
- ✅ Verify migrations ran successfully
- ✅ Edge Functions need to be deployed

### Login not working

- ✅ Make sure you created admin user
- ✅ Check email/password are correct
- ✅ Verify RLS policies are set (migration 3)

### Videos not loading

- ✅ Check Storage bucket exists
- ✅ Verify video files are uploaded
- ✅ Check metadata in `tutorials` table
- ✅ Edge Functions must be deployed for signed URLs

### "Relation does not exist" error

- ✅ Run migrations in correct order
- ✅ Check Table Editor to see if tables exist
- ✅ Re-run failed migrations

---

## 📊 Quick Status Check

Run this query in **SQL Editor** to verify setup:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'test_history';

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'tutorials';
```

Should return:
- ✅ Tables: `test_history`, `tutorials`, `user_video_progress`
- ✅ Policies on `test_history`
- ✅ Storage bucket `tutorials`

---

## 🎉 Next Steps

### Minimum to Get Started:

1. ✅ Run database migrations (Steps 1.1-1.2)
2. ✅ Create admin user (Step 2)
3. ✅ Preview app in Figma Make
4. ✅ Login and explore!

### For Full Features:

4. 🚀 Deploy Edge Functions (Step 3 - any option)
5. 🎥 Upload videos (Step 4 - optional)
6. 📱 Test in Telegram (optional)

---

## 💡 Pro Tips

1. **Start Simple:** Get database + auth working first
2. **Test Often:** Use Figma Make preview frequently
3. **Check Logs:** Supabase Dashboard → Logs for debugging
4. **Use GitHub:** Best way to manage code + auto-deploy
5. **Ask for Help:** Share error messages (without credentials!)

---

## 📞 Need Help?

If something doesn't work:

1. **Check browser console** (F12 → Console tab)
2. **Check Supabase logs** (Dashboard → Logs)
3. **Share error messages** (remove any keys/secrets first!)
4. **Screenshot the issue**

I'm here to help! 🚀

---

**You're all set to get started! Run those migrations and preview the app!** 🎉
