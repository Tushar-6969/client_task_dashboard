# Client Task Dashboard

A mini **Client Task Dashboard** built with **Next.js** and **Supabase**.  
Allows staff and admins to track client tasks with a clean, dynamic dashboard.

---

## Live Demo

https://client-task-dashboard-omega.vercel.app

---

## GitHub Repository

https://github.com/Tushar-6969/client_task_dashboard

---

## Features

- Authentication: Email / Google login via Supabase Auth  
- Role-based Access Control:
  - Admin: Can view, create, edit, delete all tasks and assign tasks to staff  
  - Staff: Can view and update only their own tasks  
- Task Management:
  - Dynamic filters: Pending, In Progress, Completed  
  - Priority tagging: Low / Medium / High  
  - Overdue warning: Tasks past their due date are highlighted  
- Row-Level Security (RLS): Secures tasks table in Supabase based on role  

---

## Screenshots

![Dashboard Screenshot](./dashboard_screenshot.png)

---

## Full Setup Instructions (All-in-One)

1. **Clone the repository**
- Open terminal and run:
  git clone https://github.com/Tushar-6969/client_task_dashboard.git
  cd client_task_dashboard

2. **Install dependencies**
- Run: npm install

3. **Configure Supabase**
- Create a project at https://supabase.com
- Go to Settings → API and copy your SUPABASE_URL and SUPABASE_ANON_KEY
- Create a `.env.local` file in the project root:
  NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co  
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
- Add Redirect URLs in Supabase Auth settings:  
  http://localhost:3000  
  https://client-task-dashboard-omega.vercel.app

4. **Database Setup**
- In Supabase SQL editor, run:

DROP TABLE IF EXISTS tasks;  
DROP TABLE IF EXISTS profiles;  

CREATE TABLE profiles (  
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  
  role text DEFAULT 'staff'  
);  

CREATE TABLE tasks (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  title text NOT NULL,  
  description text,  
  created_at timestamp DEFAULT now(),  
  due_date timestamp,  
  priority text DEFAULT 'medium',  
  status text DEFAULT 'pending',  
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE  
);  

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;  

CREATE POLICY "admin full access profiles" ON profiles  
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));  

CREATE POLICY "admin full access tasks" ON tasks  
FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));  

CREATE POLICY "staff self tasks" ON tasks  
FOR SELECT USING (assigned_to = auth.uid());  

CREATE POLICY "staff self tasks update" ON tasks  
FOR UPDATE USING (assigned_to = auth.uid());

5. **Create Admin User**
- By default, new users are staff  
- To make a user admin:
  - Go to Supabase → Table Editor → profiles
  - Find user by Auth ID
  - Change role to admin

6. **Run Locally**
- Run: npm run dev
- Open http://localhost:3000 and login with email or Google

7. **Deploy on Vercel**
- Push code to GitHub
- Go to Vercel → New Project → Import GitHub repo
- Add environment variables (same as .env.local)
- Set Redirect URL in Supabase Auth to your Vercel domain:
  https://client-task-dashboard-omega.vercel.app

---

## Custom Features

- Priority Tag: Low / Medium / High  
- Overdue Highlight: Tasks past due date are visually highlighted  

---

## Tech Stack

- Frontend: Next.js 16, React  
- Backend: Supabase (Auth, Postgres, RLS)  
- Deployment: Vercel  

---

## Known Issues

- Admins must be set manually in Supabase  
- RLS policies must be correctly applied; otherwise tasks may not appear for staff/admin
