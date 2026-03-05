# 🚀 DASHBOARDS & CORE LOGIC: THE ARCHITECTURE

## 1️⃣ ADMIN DASHBOARD: The Architect's View
The Admin Dashboard is the "Engine Room" of TCF Canada. It provides a high-level overview and deep-dive controls for the platform's ecosystem.

### 🛠️ Content Factory
- **The Hierarchy**: Administrators create **Courses** (e.g., Compréhension Écrite), which contain multiple **Lessons**.
- **Media Integration**: Lessons link to the `audio_files` table, serving as the source for listening exercises and resources.
- **The Simulator**: The `practice_tests` logic maps complex questions to `test_attempts`. Admins define passing thresholds and time limits to mirror real TCF conditions.

### 👥 User Oversight
- **Role Management**: Instant role switching (Student ↔ Instructor ↔ Admin) via the `user_profiles` table, which dynamically updates the available UI on the next login.
- **Audit Trails**: The `admin_activity_log` tracks critical actions to monitor platform health and instructor productivity.

### 💳 Financial & Support Logic
- **Revenue Hub**: Real-time tracking from `payment_history` to monitor plan performance (Basique, Premium, VIP).
- **Communication**: The `contact_submissions` table acts as a centralized ticketing system for user support.

---

## 2️⃣ STUDENT DASHBOARD: The Learner's Hub
A reactive interface that evolves based on user activity and subscription status.

### 📊 Progress Tracking (`user_statistics`)
- **Dynamic Stats**: Real-time calculation of "Streak," "Study Hours," and "Lesson Completion" by querying `user_lesson_progress`.
- **The "Resume" Logic**: The system identifies the last incomplete lesson in `user_lesson_progress` and highlights it for the user to pick up where they left off.

### 📘 Course Experience
- **Enrollment Flow**: The app verifies `user_course_enrollments` before granting access to content.
- **Access Control (Subscription Gate)**:
  - **Free Users**: Encounter "Locked" icons for content requiring a plan.
  - **Paid Users**: The `subscriptions` table is checked (`is_active = true`); if valid, all premium gates are automatically lifted.

---

## 3️⃣ PAGE LOGIC & USER LIFECYCLE

| Phase | Action | Logic / Database Involved |
| :--- | :--- | :--- |
| **1. Entry** | Login / Register | Supabase Auth + `user_profiles` trigger |
| **2. Routing** | Role Check | `middleware.ts` reads `user_role` and redirects |
| **3. Learning** | Lesson Viewing | Updates `user_lesson_progress` on completion |
| **4. Testing** | TCF Simulation | Creates `test_attempts` & `submissions` |
| **5. Growth** | Milestone Reached | Updates `user_achievements` & `user_statistics` |
| **6. Upgrade** | Payment | `payment_history` logs and `subscriptions` updates |

---

## 👤 USER PROFILE: The Identity Card
The only place where students have direct **Write Access** to their identity data.
- **Self-Correction**: Users update their `study_goal` (Immigration, Work, Study) and `target_score` (CLB 7+).
- **Goal Visualization**: This data is synced back to the Student Dashboard to show "How close you are to your goal."
- **Account Safety**: Sensitive operations like password resets are handled via **Supabase Auth**, keeping the database secure.

---

## 🧠 THE "SOURCE OF TRUTH" PHILOSOPHY
- **Supabase Auth is the Lock**: It controls authentication and entry.
- **`user_profiles` is the Key**: It defines roles and permissions levels.
- **RLS (Row Level Security) is the Guard**: **CRITICAL SECURITY**. It ensures students only see their own scores, while Admins have restricted access to revenue and logs. No student can bypass RLS to access Admin APIs or other users' data.
