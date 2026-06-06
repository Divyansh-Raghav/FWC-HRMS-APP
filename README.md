# 🏢 HRMS — AI-Powered Human Resource Management System

> Built for the **FWC IT Services Hackathon 2026** — A full-stack, role-based HRMS with 4 integrated AI features powered by Google Gemini.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend | _coming soon (Vercel)_ |
| ⚙️ Backend API | https://fwc-hrms-app.onrender.com/|

---

## 📸 Screenshots

> Login Page · Dashboard · Employee Management · AI Features · Job Portal

---

## ✨ Features

### 👥 Role-Based Access Control
5 distinct roles, each with tailored dashboards and permissions:

| Role | Access |
|---|---|
| **Admin** | Full system access — all modules |
| **Senior Manager** | Dashboard, employees, attendance, performance, AI |
| **HR Recruiter** | Employees, recruitment, AI features |
| **Employee** | Own attendance, own payslips, HR chatbot |
| **Applicant** | Job portal only — view & apply with PDF resume |

### 🤖 4 AI Features (Google Gemini)
- **Resume Screener** — Scores a resume against a job description (0–100) with strengths, weaknesses, and recommendation
- **HR Chatbot** — Answers employee HR policy questions in real time
- **Performance Review Generator** — Auto-generates professional reviews from KPIs and manager feedback
- **AI Interview Bot** — Conducts live screening interviews for job applicants

### 📋 Core HR Modules
- **Employee Management** — Full CRUD with department, role, salary tracking
- **Attendance & Leave** — Clock in/out system + leave request approval workflow
- **Payroll** — Generate payslips, mark as paid, per-employee history
- **Performance Reviews** — Quarterly reviews with ratings and AI-generated summaries
- **Recruitment** — Job postings, applicant tracking, AI resume screening
- **Applicant Portal** — Public job portal with PDF resume upload and AI match scoring

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) + **TypeScript**
- **TailwindCSS** for styling
- **Recharts** for dashboard charts
- **js-cookie** for JWT token management

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** for database
- **JWT** for authentication
- **Multer** + **pdf-parse** for PDF resume parsing

### AI
- **Google Gemini 2.5 Flash** via REST API (free tier)

### Deployment
- **Vercel** — Frontend
- **Render** — Backend
- **MongoDB Atlas** — Cloud database

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/hrms-app.git
cd hrms-app
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Set up environment variables

Create `hrms-app/.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `hrms-app/backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

### 5. Seed the database
```bash
cd backend
npm run seed
cd ..
```

### 6. Run the app

Terminal 1 — Frontend:
```bash
npm run dev
# http://localhost:3000
```

Terminal 2 — Backend:
```bash
cd backend
npx ts-node src/index.ts
# http://localhost:5000
```

---

## 👤 Demo Accounts

All accounts use password: `password123`

| Role | Email | Redirects To |
|---|---|---|
| Admin | admin@hrms.com | /dashboard |
| Senior Manager | manager@hrms.com | /dashboard |
| HR Recruiter | hr@hrms.com | /dashboard |
| Employee | john@hrms.com | /dashboard |
| Applicant | applicant@hrms.com | /jobs |

---

## 📁 Project Structure

```
hrms-app/
├── app/
│   ├── api/ai/route.ts          ← Gemini AI endpoints
│   ├── login/page.tsx           ← Login with demo accounts
│   ├── register/page.tsx        ← Applicant registration
│   ├── jobs/page.tsx            ← Public job portal
│   └── dashboard/
│       ├── page.tsx             ← Role-based dashboard + charts
│       ├── employees/           ← Employee CRUD
│       ├── attendance/          ← Clock in/out + leaves
│       ├── payroll/             ← Payslips + payroll generation
│       ├── performance/         ← Performance reviews
│       ├── recruitment/         ← Job postings + applications
│       └── ai/                  ← All 4 AI features
├── components/
│   ├── layout/Sidebar.tsx       ← Role-based navigation
│   └── ui/StatCard.tsx          ← Dashboard stat cards
├── lib/
│   ├── authContext.tsx          ← Auth context + useAuth hook
│   └── api.ts                   ← Authenticated API helper
└── backend/
    └── src/
        ├── index.ts             ← Express entry point
        ├── models/              ← Mongoose schemas
        ├── controllers/         ← Business logic
        ├── routes/              ← API routes
        ├── middleware/          ← JWT auth middleware
        └── config/seed.ts       ← Database seeder
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/register-applicant
POST   /api/auth/login
GET    /api/auth/me
```

### Employees
```
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
```

### Attendance & Leave
```
GET    /api/attendance
POST   /api/attendance/clock-in
POST   /api/attendance/clock-out
GET    /api/attendance/leaves
POST   /api/attendance/leaves
PUT    /api/attendance/leaves/:id
```

### Payroll
```
GET    /api/payroll
POST   /api/payroll/generate
PUT    /api/payroll/:id/pay
```

### Performance
```
GET    /api/performance
POST   /api/performance
PUT    /api/performance/:id
```

### Recruitment
```
GET    /api/recruitment
POST   /api/recruitment
PUT    /api/recruitment/:id
POST   /api/recruitment/:id/apply
PUT    /api/recruitment/:jobId/applications/:appId
```

### Upload
```
POST   /api/upload/pdf
```

---

## 🤖 AI Features Details

### Resume Screener
- Upload a PDF resume on the job portal
- AI scores it against the job description (0–100)
- Returns strengths, weaknesses, and hire recommendation
- Score is saved with the application for HR to review

### HR Chatbot
- Available to all internal employees
- Answers questions about leave policies, payroll, office hours
- Maintains conversation history within session

### Performance Review Generator
- Manager inputs employee KPIs, rating (1–5), and feedback
- AI generates a full professional review with achievements, improvement areas, and training recommendations

### AI Interview Bot
- HR sets up a job with description
- Applicants chat with AI interviewer
- AI asks technical + behavioral questions one at a time
- Provides final assessment score after 4–5 questions

---

## 🔐 Security Features
- JWT tokens stored in HTTP cookies (7 day expiry)
- Role-based route protection via Next.js middleware
- Backend `protect` + `authorize` middleware on all routes
- Applicants blocked from internal dashboard routes
- PDF upload limited to 5MB

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Routes returning 404 | `taskkill /F /IM node.exe` then restart backend |
| Input text not visible | Add `input { color: black !important; }` to globals.css |
| Gemini quota exceeded | Switch model or wait for daily reset (12:30 PM IST) |
| PDF parse error | Use `pdf-parse@1.1.1` and `require('pdf-parse')` |
| Login redirect error | Wrap `router.push()` in `useEffect` |

---

## 👨‍💻 Author

**Raghav & Divyansh**
FWC IT Services Hackathon 2026

---

## 📄 License

This project was built for hackathon purposes under FWC IT Services.
