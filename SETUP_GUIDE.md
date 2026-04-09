# HireIQ Frontend - Setup & Usage Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with npm or yarn)
- Backend API running on `http://localhost:8000`

### Installation & Running

```bash
# 1. Navigate to frontend directory
cd hireiq-refactored

# 2. Install dependencies
npm install

# 3. Configure environment (optional)
# Create .env.local if needed:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Start development server
npm run dev

# Frontend will be available at http://localhost:3000 (or 3001 if 3000 is in use)
```

## 🔐 Default Credentials

```
Email: admin@hireiq.dev
Password: admin1234
```

## 📱 Pages & Features

### Authentication Flow
1. **Login** (`/auth/login`)
   - Enter credentials
   - JWT token stored locally
   - Redirects to dashboard on success

2. **Register** (`/auth/register`)
   - Create new account
   - Automatic login after registration

3. **Forgot Password** (`/auth/forgot-password`)
   - Enter email
   - Backend sends reset link
   - Check email for reset instructions

### Dashboard Pages

#### 1. **Jobs** (`/dashboard/jobs`)
- View all job openings
- **Create Job** button opens form with:
  - Job title, department, location
  - Experience requirements
  - Salary range
  - Required/preferred skills
  - Full description
- Filter by:
  - Status (Active, Paused, Draft, Closed)
  - Department
  - Search by title
- Each job card shows:
  - Total candidates
  - Shortlisted count
  - Conversion rate
  - Closing date

#### 2. **Candidates** (`/dashboard/candidates`)
- View all candidates
- Filter by:
  - Status (New, Under Review, Shortlisted, etc.)
  - Job applied for
  - Score range
  - Search by name/email
- Sort by:
  - Score (highest first)
  - Name
  - Date created
- Click candidate to view:
  - Full resume (parsed data)
  - Scored skills
  - Experience & education
  - Assessment results
  - Recruiter notes
  - Status management

#### 3. **Uploads** (`/dashboard/uploads`)
- **Drag & drop** resumes to upload
- Or click to browse files
- Accepts: PDF, DOCX, DOC, TXT (max 10MB, max 50 per batch)
- View upload history:
  - File name and size
  - Upload status (Pending, Processing, Parsed, Scored, Failed)
  - Associated job (if any)
  - Timestamps
- Actions:
  - Retry failed uploads
  - Delete uploads
  - Link to job (when creating)

#### 4. **Assessments** (`/dashboard/assessments`)
- **Create Assessment** button
- Choose type:
  - Technical (code/technical knowledge)
  - Behavioral (soft skills)
  - Cognitive (problem solving)
  - Coding (programming challenge)
- View assessments:
  - Description
  - Duration
  - Number of assignments
  - Creation date
- **Assign Assessment** button
  - Select candidates
  - Set due date
  - Send notifications
- View assignments:
  - Candidate status
  - Completion percentage
  - Submitted time

#### 5. **Results** (`/dashboard/results`)
- View assessment results
- Candidate scores and feedback
- Performance breakdown

#### 6. **Analytics** (`/dashboard/analytics`)
- Dashboard metrics:
  - Total candidates
  - Resumes processed
  - Shortlisted count
  - Pending reviews
  - Average score
  - Processing queue
- Charts:
  - Upload trends (30 days)
  - Score distribution (histogram)
  - Top skills (bar chart)
  - Conversion funnel (stages)
- Date range filter
- Export data (export button ready)

#### 7. **Settings** (`/dashboard/settings`)
- User profile
- Change password
- Notification preferences
- Organization settings (when available)

## 🎯 Workflow Examples

### Creating & Screening a Job

1. Go to **Jobs** page
2. Click **New Job** button
3. Fill in job details:
   - Title: "Senior React Developer"
   - Department: "Engineering"
   - Required skills: React, TypeScript, Node.js
   - Job description
4. Click **Create Job**
5. Go to **Uploads**
6. Upload candidate resumes for this job
7. View **Analytics** to see recruitment funnel
8. Go to **Candidates** to review screened candidates

### Assessing Candidates

1. Go to **Assessments**
2. Create new assessment
   - Type: Technical
   - Add questions
3. Click **Assign Assessment**
4. Select shortlisted candidates
5. Set due date
6. Send assessments
7. View **Results** when candidates complete
8. Review scores and feedback

### Managing Candidate Status

1. Go to **Candidates**
2. Click on candidate to view profile
3. Current status shown in card
4. Update status using dropdown/button
5. Add notes about candidate
6. Track in **Analytics** funnel

## 🔄 Data Flow

```
Resume Upload
    ↓
Background Processing (Celery)
    ↓
Parsing & Scoring (TF-IDF)
    ↓
Candidate Created
    ↓
View in Candidates Page
    ↓
Create Assessment
    ↓
Assign & Send
    ↓
Candidate Completes
    ↓
View Results
    ↓
Make Hiring Decision
```

## ⚙️ Configuration

### Environment Variables
Create `.env.local` in project root:

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional - for custom deployments
NEXT_PUBLIC_APP_NAME=HireIQ
```

### Theming
- Click **Sun/Moon** icon in top bar to toggle theme
- Supports Light, Dark, and System modes
- Persists in localStorage

### Notifications
- All actions show toast notifications
- Errors, successes, and warnings
- Auto-dismiss after 3 seconds

## 🐛 Troubleshooting

### "Network error" message
- Ensure backend is running on http://localhost:8000
- Check CORS settings in backend
- Verify API_URL in .env.local

### "Session expired" message
- Token may have expired
- Click "Login" to re-authenticate
- Session lasts 60 minutes (configurable in backend)

### Form submission fails
- Check browser console for detailed error
- Validate all required fields (marked with *)
- Ensure file formats are correct (for uploads)

### Upload stuck on "Processing"
- Wait for Celery worker to process
- Check backend logs: `celery -A app.workers.resume_processor.celery_app worker`
- Click retry if upload fails

## 📚 API Reference

All endpoints use JWT Bearer token authentication:
```
Authorization: Bearer <token>
```

### Example: Create Job
```bash
curl -X POST http://localhost:8000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Engineer",
    "department": "Engineering",
    "location": "Remote",
    "type": "full_time",
    "description": "...",
    "requiredSkills": ["Python", "FastAPI"],
    "minExperienceYears": 5
  }'
```

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
docker build -t hireiq-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  hireiq-frontend
```

## 📞 Support

For issues or questions:
1. Check backend logs: `docker logs hireiq-api`
2. Check frontend logs: Browser DevTools Console
3. Verify API connectivity: Visit http://localhost:8000/docs
4. Check Celery worker status if uploads are stuck

## ✅ Checklist for Going Live

- [ ] Backend is running and accessible
- [ ] Database migrations completed
- [ ] Redis cache is running
- [ ] Celery worker is running
- [ ] SMTP configured for emails (forgot password)
- [ ] Frontend .env configured with production API URL
- [ ] SSL certificates installed
- [ ] CORS origins configured
- [ ] Rate limiting enabled on auth endpoints
- [ ] Backup strategy in place
- [ ] Monitoring & logging configured
- [ ] Admin user created

---

**Ready to use!** The HireIQ frontend is fully functional and connected to your backend.
