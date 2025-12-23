# 🗄️ Supabase Database Setup Guide

Complete guide to setting up Supabase as a backup database for ASPERA.

## 📋 Prerequisites

- Supabase account (free tier is sufficient)
- Python environment with dependencies installed
- Node.js environment for frontend

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project settings:
   - **Name:** ASPERA-Backup
   - **Database Password:** (generate a strong password)
   - **Region:** Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify tables were created in **Table Editor**

### Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 4: Configure Backend

Create `.env` file in project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# Existing AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default
```

### Step 5: Configure Frontend

Create `frontend/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AWS (Optional)
NEXT_PUBLIC_API_URL=https://your-api.amazonaws.com/prod
NEXT_PUBLIC_S3_BUCKET=aspera-documents
NEXT_PUBLIC_REGION=us-east-1
```

### Step 6: Install Dependencies

#### Backend (Python)

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install Supabase client
pip install supabase
```

#### Frontend (Node.js)

```powershell
cd frontend
npm install
```

### Step 7: Test Connection

Run the test script:

```powershell
# Activate venv first
.\venv\Scripts\Activate.ps1

# Run test
python test-supabase.py
```

Expected output:
```
============================================================
ASPERA Supabase Connection Test
============================================================

[1/6] Checking environment variables...
✓ SUPABASE_URL: https://xxxxx.supabase.co...
✓ SUPABASE_KEY: ********************

[2/6] Initializing Supabase client...
✓ Client initialized

[3/6] Testing database connection...
✓ Connection successful

[4/6] Testing document operations...
✓ Created document: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✓ Retrieved document: test-document.pdf
✓ Updated status: completed

[5/6] Testing finding operations...
✓ Created finding: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✓ Retrieved 1 finding(s)

[6/6] Testing agent execution tracking...
✓ Created execution: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✓ Completed execution: completed

Testing analytics views...
✓ Document stats: 2 status groups
✓ Agent performance: 1 agents tracked

Testing system logging...
✓ Created log entry: Test log message

============================================================
✅ ALL TESTS PASSED!
============================================================
```

## 📊 Database Schema

The database includes these tables:

### Documents
- Stores uploaded document metadata
- Tracks processing status
- Links to S3 keys for file storage

### Findings
- Stores agent findings
- Categorized by severity
- Includes recommendations and confidence scores

### Agent Executions
- Tracks agent execution history
- Records execution time and status
- Links to findings produced

### System Logs
- Application-wide logging
- Categorized by level (info, warning, error)
- Includes metadata for debugging

## 🔍 Viewing Data

### Supabase Dashboard

1. Go to **Table Editor**
2. Select table to view
3. Use filters and search
4. Export to CSV if needed

### Using SQL Editor

```sql
-- Get recent documents
SELECT * FROM documents 
ORDER BY created_at DESC 
LIMIT 10;

-- Get critical findings
SELECT f.*, d.filename 
FROM findings f
JOIN documents d ON f.document_id = d.id
WHERE f.severity = 'critical'
ORDER BY f.created_at DESC;

-- Get agent performance
SELECT * FROM agent_performance;

-- Get document statistics
SELECT * FROM document_stats;
```

## 🔐 Security Configuration

### Row Level Security (RLS)

Current setup allows all operations (development mode).

For production, update policies in **Authentication** → **Policies**:

```sql
-- Example: Restrict document access by user
CREATE POLICY "Users can only see their own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);
```

### API Keys

- **anon key:** Safe for frontend (public)
- **service_role key:** Backend only (secret)

## 🛠️ Usage Examples

### Backend (Python)

```python
from src.utils.supabase_client import get_db

# Get database instance
db = get_db()

# Create document
doc = await db.create_document(
    filename="report.pdf",
    file_type="pdf",
    file_size=2048000,
    s3_key="documents/2024/report.pdf",
    metadata={"year": 2024, "quarter": "Q4"}
)

# Create finding
finding = await db.create_finding(
    document_id=doc['id'],
    agent_type="consistency",
    severity="high",
    title="Revenue Discrepancy",
    description="Found inconsistency in revenue figures",
    recommendation="Verify Q3 revenue calculation",
    confidence_score=0.92
)

# Track agent execution
execution = await db.create_agent_execution(
    document_id=doc['id'],
    agent_type="consistency"
)

# Complete execution
await db.complete_agent_execution(
    execution_id=execution['id'],
    findings_count=3,
    execution_time_ms=12000
)

# Log system event
await db.log(
    level="info",
    message="Document processing completed",
    component="orchestrator",
    metadata={"document_id": doc['id']}
)
```

### Frontend (TypeScript)

```typescript
import { supabase } from '@/lib/supabase'

// Fetch documents
const { data: documents, error } = await supabase
  .from('documents')
  .select('*')
  .eq('processing_status', 'completed')
  .order('created_at', { ascending: false })

// Fetch findings with document info
const { data: findings } = await supabase
  .from('findings')
  .select(`
    *,
    documents (
      filename,
      file_type
    )
  `)
  .eq('severity', 'critical')

// Real-time subscriptions
supabase
  .channel('findings')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'findings' },
    (payload) => {
      console.log('New finding:', payload.new)
    }
  )
  .subscribe()
```

## 📈 Analytics Queries

### Document Processing Stats

```sql
SELECT 
    processing_status,
    COUNT(*) as count,
    ROUND(AVG(file_size)/1024/1024, 2) as avg_size_mb
FROM documents
GROUP BY processing_status;
```

### Top Agents by Findings

```sql
SELECT 
    agent_type,
    COUNT(*) as total_findings,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count
FROM findings
GROUP BY agent_type
ORDER BY total_findings DESC;
```

### Recent Activity

```sql
SELECT 
    d.filename,
    ae.agent_type,
    ae.status,
    ae.execution_time_ms,
    ae.findings_count,
    ae.start_time
FROM agent_executions ae
JOIN documents d ON ae.document_id = d.id
ORDER BY ae.start_time DESC
LIMIT 20;
```

## 🔄 Backup & Export

### Manual Backup

1. Go to **Database** → **Backups**
2. Enable automatic daily backups
3. Download backup manually if needed

### Data Export

```powershell
# Export to CSV using Supabase CLI
supabase db dump --table documents > documents.sql
supabase db dump --table findings > findings.sql
```

## 🐛 Troubleshooting

### Connection Errors

**Problem:** `Error: Invalid API key`

**Solution:** 
- Verify SUPABASE_URL and SUPABASE_KEY in `.env`
- Check you're using `anon` key (not `service_role`)
- Ensure no extra spaces in environment variables

### Permission Errors

**Problem:** `new row violates row-level security policy`

**Solution:**
- Check RLS policies in Table Editor
- Verify policies allow INSERT/UPDATE/DELETE
- For development, disable RLS temporarily

### Schema Errors

**Problem:** `relation "documents" does not exist`

**Solution:**
- Re-run `supabase/schema.sql` in SQL Editor
- Check for SQL errors in execution log
- Verify you're in the correct project

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Python Client Docs](https://supabase.com/docs/reference/python/introduction)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Production Checklist

Before deploying to production:

- [ ] Enable automatic backups
- [ ] Configure proper RLS policies
- [ ] Use `service_role` key for backend (not `anon`)
- [ ] Set up database monitoring alerts
- [ ] Review and optimize indexes
- [ ] Enable SSL enforcement
- [ ] Set up API rate limiting
- [ ] Configure CORS settings
- [ ] Enable audit logging
- [ ] Set up error tracking (Sentry)

---

**Questions or issues?** Check the Supabase dashboard logs or contact support.
