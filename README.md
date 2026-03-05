
<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=50&duration=4&pause=20&color=9B31FE&center=true&vCenter=true&width=482&lines=........" alt="l" /> 
</div>
 
# TCF Canada - Complete Learning Platform

A full-stack learning platform to prepare learners for the **TCF Canada exam** (Test de Connaissance du Français) covering all four sections: reading, listening, writing, and speaking.

## 🎯 Project Overview

**TCF Canada** is a production-ready platform built with Next.js 15, Supabase, and Stripe. It provides comprehensive TCF Canada exam preparation with practice tests, instructor review, progress tracking, and subscription management.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + React 18
- **Backend:** Next.js API routes (Node-style server functions)
- **Database/Auth/Storage:** Supabase (PostgreSQL + Auth + Storage buckets)
- **Payments:** Stripe (Checkout + Subscriptions + Webhooks)
- **UI Components:** Heroicons + Custom React Components
- **Styling:** Tailwind CSS + PostCSS
- **Development:** ESLint + Prettier + TypeScript
- **Hosting:** Vercel (frontend) + Supabase (backend/storage)
- **File Handling:** Audio recording, file uploads, signed URLs
- **State Management:** React Context API

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Stripe account (for payment processing)
- Git

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd tcf_canada_prep
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

Based on your current `.env` setup, you need these three essential variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Optional Environment Variables (for full functionality):**

```env
# Stripe Configuration (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Additional Supabase (optional duplicates)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Minimum Setup (Current Configuration):**
Your project currently works with just the three Supabase variables. Add Stripe variables only when implementing payment features.

### 4. Database Setup

#### Local Development with Supabase CLI
Follow these commands for local development:

```bash
# 1. Start local Supabase instance
supabase start

# 2. Run migrations to create tables and RLS
supabase db push

# 3. Seed the database with test data
supabase db seed
```

#### Manual Setup (Alternative)
If you prefer manual setup via the dashboard, run the SQL files in `supabase/migrations/` in chronological order, followed by `supabase/seed.sql`.

**Default Test Accounts:**
- **Student:** etudiant@tcfcanada.com / Etudiant123!
- **Instructor:** instructeur@tcfcanada.com / Instructeur123!
- **Admin:** admin@tcfcanada.com / Admin123!
- **Admin (Gmail):** admin@gmail.com / Adminadmin

### 5. Supabase Storage Setup

Create the following storage buckets in Supabase:

1. **course-assets** (public)
   - Public access for course images and documents
   - Policies: Allow public read access

2. **exam-audio** (private)
   - Private access for listening exercises
   - Policies: Authenticated users can read

3. **student-submissions** (private)
   - Private access for student uploads
   - Policies: Users can upload their own files, instructors can read

### 6. Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
4. Copy the webhook secret to `.env.local`

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Verify Installation

**Check these pages work:**
- Landing page: `http://localhost:3000/landing-page`
- User login: `http://localhost:3000/user-login`
- Student dashboard: `http://localhost:3000/student-dashboard`
- Admin dashboard: `http://localhost:3000/admin-dashboard`

**Test authentication:**
1. Go to `/user-login`
2. Use test credentials (see Database Setup section)
3. Verify role-based access works
4. 
  <div align="center">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=50&duration=4&pause=20&color=d4002e&center=true&vCenter=true&width=482&lines=........" alt="l" /> 
</div>

## 📁 Project Structure

```
tcf_canada_prep/
├── public/
│   ├── assets/images/          # Static images
│   ├── B_Fonctionnelle/        # Use case diagrams (PlantUML)
│   ├── B_Technique/            # Database schema diagrams (PlantUML)
│   └── favicon.ico             # Site favicon
├── scripts/
│   ├── seed-users.js           # User seeding script
│   └── seed-users.ts           # TypeScript version
├── src/
│   ├── app/
│   │   ├── api/                # Next.js API routes
│   │   │   ├── admin/         # Admin endpoints (analytics, users)
│   │   │   ├── attempts/      # Test attempt management
│   │   │   ├── audio/upload/  # Audio file upload handling
│   │   │   ├── courses/       # Course CRUD endpoints (Legacy - Unused)
│   │   │   ├── lessons/       # Lesson management (Legacy - Unused)
│   │   │   ├── plans/         # Subscription plans
│   │   │   ├── submissions/   # Writing/speaking submissions
│   │   │   ├── stripe-webhook/ # Stripe payment webhooks
│   │   │   ├── test/          # Test page endpoint
│   │   │   ├── tests/         # Practice test endpoints
│   │   │   └── user/          # User dashboard & progress
│   │   ├── admin-content-management/ # Content management interface
│   │   ├── admin-dashboard/    # Admin analytics dashboard
│   │   ├── admin-user-management/   # User management interface
│   │   ├── auth/callback/      # Supabase auth callback
│   │   ├── course-content/     # Course viewing interface (Legacy - Not accessible via UI)
│   │   ├── courses/           # Course catalog & detail pages (Legacy - Not accessible via UI)
│   │   ├── landing-page/       # Public landing page
│   │   ├── pricing-plans/     # Subscription pricing page
│   │   ├── student-dashboard/ # Student progress dashboard
│   │   ├── user-login/        # Authentication pages
│   │   ├── user-profile/      # User profile management
│   │   ├── user-registration/ # User registration flow
│   │   ├── layout.tsx         # Root layout component
│   │   └── not-found.tsx      # 404 error page
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Shared components (headers, sidebars)
│   │   └── ui/                # Basic UI components
│   ├── contexts/               # React contexts (Auth, etc.)
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/
│   │   ├── supabase/          # Supabase client configurations
│   │   ├── config.ts          # App configuration
│   │   └── testSupabase.ts    # Supabase connection testing
│   ├── styles/                # Global styles
│   │   ├── index.css          # Main stylesheet
│   │   └── tailwind.css       # Tailwind imports
│   ├── types/                 # TypeScript type definitions
│   │   └── database.types.ts  # Supabase generated types
│   └── middleware.ts           # Route protection middleware
├── supabase/
│   ├── .temp/                 # Supabase CLI temporary files
│   ├── migrations/            # Database schema migrations
│   │   ├── 20260123200500_tcf_canada_platform.sql
│   │   ├── 20260126170000_add_instructor_role.sql
│   │   ├── 20260126170100_practice_tests_questions.sql
│   │   ├── 20260126170200_test_attempts_submissions.sql
│   │   ├── 20260126170300_plans_stripe_integration.sql
│   │   ├── 20260126170400_course_lesson_updates.sql
│   │   └── 20260127000000_storage_setup.sql
│   ├── seed.sql               # Database seed data
│   └── seedForSqlEditSupabase.sql # Manual seeding script
├── .env                       # Environment variables (local)
├── .env.ex                    # Environment example file
├── .env.example               # Environment template
├── implementation_plan.md     # Development implementation plan
├── SETUP_INSTRUCTIONS.md      # Detailed setup guide
├── STORAGE_SETUP.md           # Supabase storage configuration
└── README.md                  # This file
```

## 👥 User Roles & Permissions

### Role Hierarchy
```
Visitor < Student < Instructor < Admin
```

### Capabilities

**Visitor:**
- View landing page, pricing, public courses
- View landing page and pricing plans
- Register account, login, reset password

**Student:**
- Access dashboard and practice tests based on subscription plan
- Take practice tests with timer and auto-save
- Submit writing/speaking tasks
- Track progress and view feedback
- Manage subscription and payment history

**Instructor:**
- All Student features
- View pending submissions
- Review and score writing/speaking submissions
- Provide detailed feedback
- View student performance analytics

**Admin:**
- All Instructor features
- Manage courses, lessons, and practice tests
- Upload and manage media content
- Manage users and assign roles
- View platform analytics and revenue reports
- System administration

## 🗄️ Database Schema

The database schema follows the PlantUML diagrams in `public/B_Technique/Conception.PlantUML`.

**Core Tables:**
- `user_profiles` - User information and roles
- `courses` - Course catalog (Legacy)
- `lessons` - Individual lessons (Legacy)
- `practice_tests` - Practice test definitions
- `questions` - Test questions
- `test_attempts` - User test attempts
- `submissions` - Writing/speaking submissions
- `subscriptions` - User subscriptions
- `plans` - Subscription plans
- `payment_history` - Payment records

## 🔐 Security Features

- **Row Level Security (RLS):** All tables have RLS policies
- **Role-based Access Control:** Middleware protects routes by role
- **Signed URLs:** Secure file uploads/downloads
- **Input Validation:** All API endpoints validate input
- **Session Management:** Secure cookie-based sessions

## 📊 Key Features

### Test Simulator
- **Timer:** Accurate countdown with auto-submit
- **Auto-save:** Answers saved every 10-15 seconds
- **Tab Control:** Prevents multiple active test sessions
- **Navigation Prevention:** Blocks back button and page refresh

### Writing Interface
- **Rich Text Editor:** Full formatting support
- **Word Counter:** Real-time word count
- **Auto-save:** Drafts saved every 30 seconds
- **Submission Lock:** Prevents editing after submission

### Speaking Interface
- **Browser Recording:** Direct audio capture
- **Real-time Visualization:** Audio waveform display
- **Quality Validation:** Checks audio quality before upload
- **Playback Review:** Review recording before submission

### Instructor Review
- **Submission Queue:** View pending submissions
- **Scoring Interface:** Rubric-based scoring
- **Rich Feedback:** Detailed comments and corrections
- **Bulk Actions:** Review multiple submissions

## 🧪 Testing

Run tests (when implemented):

```bash
npm test
```

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically

# Database (if Supabase CLI installed)
supabase start       # Start local Supabase instance
supabase db push     # Push migrations to database
supabase db seed     # Seed database with test data
supabase gen types typescript --local > src/types/database.types.ts

# Custom Scripts
node scripts/seed-users.js  # Seed users manually
```

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production

Ensure all environment variables from `.env.example` are set in:
- Vercel project settings
- Supabase project settings
- Stripe webhook configuration

### Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Storage buckets created with correct policies
- [ ] Stripe webhooks configured
- [ ] Environment variables set
- [ ] Test payment flow
- [ ] Test file uploads
- [ ] Verify email delivery
- [ ] Monitor error logs

## 📚 Documentation

- **Use Cases:** `public/B_Fonctionnelle/UseCaseDetails.PlantUML`
- **Database Schema:** `public/B_Technique/Conception.PlantUML`
- **API Routes:** See `src/app/api/` directory
- **Components:** See `src/components/` directory

## 🐛 Troubleshooting

### Common Issues

**1. Environment Variables Issues**
- Verify your `.env` file has the three required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project settings for correct values
- Restart development server after changing `.env`

**2. Supabase Connection Errors**
- Verify Supabase project is active and not paused
- Check network connectivity
- Ensure URL format is correct (https://your-project.supabase.co)

**3. Authentication Not Working**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (server-side operations)
- Check RLS policies are enabled in Supabase dashboard
- Verify user exists in `auth.users` table

**4. Database Migration Errors**
- Enable pgcrypto extension: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Run migrations in correct order (check timestamps)
- Check SQL syntax in migration files
- Verify database permissions

**5. File Upload Failures**
- Create required storage buckets in Supabase:
  - `course-assets` (public) - Legacy bucket for course-related assets.
  - `exam-audio` (private)
  - `student-submissions` (private)
- Check bucket policies allow appropriate access
- Ensure signed URL generation works

**6. Build/Runtime Errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`
- Verify all imports are correct

**7. Page Not Found (404) Errors**
- Check file structure matches Next.js App Router conventions
- Ensure `page.tsx` files exist in route directories
- Verify middleware.ts is not blocking routes incorrectly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

[Add your license here]

## 📞 Support

For issues and questions:
- Check this README and setup documentation
- Review PlantUML diagrams in `public/B_Fonctionnelle/` and `public/B_Technique/`
- Check `implementation_plan.md` for development details
- Review `SETUP_INSTRUCTIONS.md` for detailed setup
- Check `STORAGE_SETUP.md` for Supabase storage configuration
- Open an issue on GitHub with:
  - Error messages
  - Steps to reproduce
  - Environment details (Node.js version, OS, etc.)

## 🔧 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with 3 Supabase variables
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] pgcrypto extension enabled
- [ ] Test data seeded
- [ ] Storage buckets created (optional)
- [ ] Development server started (`npm run dev`)
- [ ] Landing page accessible at `http://localhost:3000/landing-page`
- [ ] Login page working at `http://localhost:3000/user-login`

--- 

  <div align="center">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=50&duration=4&pause=20&color=d4002e&center=true&vCenter=true&width=482&lines=........" alt="l" /> 
</div>