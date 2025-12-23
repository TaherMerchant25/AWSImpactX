# 🎯 Supabase Quick Start

Follow these steps to activate Supabase backup database for ASPERA.

## Step 1: Create Supabase Project (2 minutes)

1. Visit https://supabase.com and sign in/up
2. Click **"New Project"**
3. Fill in:
   - **Name:** `ASPERA-Backup`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

## Step 2: Run Database Schema (1 minute)

1. In Supabase dashboard → **SQL Editor**
2. Click **"+ New query"**
3. Open `supabase/schema.sql` from this project
4. Copy entire contents
5. Paste into SQL Editor
6. Click **RUN** (or Ctrl+Enter)
7. Should see: `Success. No rows returned`

## Step 3: Get Your API Keys (30 seconds)

1. Go to **Settings** → **API**
2. Copy these two values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGc...very long key...
```

## Step 4: Configure Environment (1 minute)

### Backend Configuration

Create `.env` file in project root:

```bash
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_KEY=YOUR-ANON-KEY-HERE
```

### Frontend Configuration

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

**Important:** Replace `YOUR-PROJECT-ID` and `YOUR-ANON-KEY` with actual values!

## Step 5: Test Connection (30 seconds)

```powershell
# Make sure venv is activated
.\venv\Scripts\Activate.ps1

# Run test script
python test-supabase.py
```

**Expected output:**
```
============================================================
ASPERA Supabase Connection Test
============================================================

[1/6] Checking environment variables...
✓ SUPABASE_URL: https://xxxxx.supabase.co...
✓ SUPABASE_KEY: ********************

... (more tests)

✅ ALL TESTS PASSED!
```

## ✅ You're Done!

Your Supabase database is ready. The system will now:

- ✅ Backup all document metadata
- ✅ Store agent findings and recommendations
- ✅ Track execution history
- ✅ Log system events
- ✅ Provide analytics and insights

## 🔍 View Your Data

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Browse tables:
   - `documents` - Uploaded files
   - `findings` - Agent discoveries
   - `agent_executions` - Processing history
   - `system_logs` - Application logs

## 📊 Sample Data

The schema includes sample data:
- 3 sample documents
- 3 sample findings
- 3 agent executions
- 4 system logs

Browse these in Table Editor to see structure.

## 🆘 Troubleshooting

**Problem:** Test fails with "Invalid API key"
- Check .env file has correct URL and key
- Ensure no extra spaces or quotes
- Try regenerating the anon key in Supabase

**Problem:** "relation documents does not exist"
- Re-run the schema.sql in SQL Editor
- Check for errors in SQL execution
- Ensure you're in the correct project

**Problem:** Permission denied
- Check RLS policies in Table Editor
- Policies should allow all operations for development
- Re-run schema.sql to reset policies

## 📚 Next Steps

- Read full documentation: `docs/SUPABASE_SETUP.md`
- View schema details: `supabase/schema.sql`
- Check Python client: `src/utils/supabase_client.py`
- See frontend integration: `frontend/lib/supabase.ts`

---

**Total Setup Time:** ~5 minutes  
**Free Tier Limits:** 500MB database, 1GB file storage, 2GB bandwidth/month
