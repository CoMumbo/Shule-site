<div align="center">

# Shule Site
**A full-stack school management platform built for modern education.**

[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[**View Live Demo**](https://shule-site.pages.dev) · [**Report Bug**](https://github.com/CoMumbo/Shule-site/issues) · [**Request Feature**](https://github.com/CoMumbo/Shule-site/issues)

</div>

---

## Overview

**Shule Site** is a comprehensive, role-based school management system that bridges the gap between public-facing school marketing and internal academic operations. 

It features a polished public-facing website where prospective students can browse courses and read news, alongside a secure, authenticated portal where students, teachers, and administrators interact with live data, manage enrollments, and track academic progress.

## Key Features

### Authentication & Security
- **JWT Authentication:** Secure login flow using access tokens (in-memory) and httpOnly refresh cookies to prevent XSS attacks.
- **Role-Based Access Control (RBAC):** Distinct permissions for Students, Teachers, and Administrators.
- **Silent Token Refresh:** Axios interceptors automatically refresh expired access tokens in the background.

### Role-Specific Dashboards
- **Student Portal:** View enrolled courses, track grades (with letter conversions), view announcements, and download/submit assignments.
- **Teacher Portal:** Manage assigned courses, post course-specific announcements, create assignments, and input/edit student grades directly from the dashboard.
- **Admin Portal:** Full system oversight. Create and manage users (Admins/Teachers), generate new courses, assign teachers, and post site-wide announcements.

### Dynamic Data & UI
- **Interactive Charts:** Live grade distribution and enrollment metrics powered by Recharts.
- **Search & Filtering:** Real-time, debounced search on the public course catalog.
- **File Uploads:** Secure multipart file handling for assignment PDFs and student submissions.
- **Responsive Design:** Fully mobile-friendly UI crafted with Tailwind CSS.

## Tech Stack

**Frontend**
- React (Vite)
- React Router v6
- Tailwind CSS
- Axios (with request/response interceptors)
- Recharts

**Backend**
- Django & Django REST Framework (DRF)
- SimpleJWT (JSON Web Tokens)
- PostgreSQL
- WhiteNoise (Static file serving)
- Gunicorn (WSGI Server)

**Infrastructure**
- **Frontend Hosting:** Cloudflare Pages
- **Backend & Database:** Render

## Architecture Highlights
- **Monorepo Structure:** Cleanly separated `backend/` and `frontend/` directories.
- **Custom User Model:** Built from `AbstractUser` using email as the primary identifier instead of a username.
- **Optimized Querysets:** Django ORM `select_related` and `prefetch_related` used to prevent N+1 query problems.
- **Ephemeral Media:** Acknowledges free-tier hosting constraints; media files are stored ephemerally.

## Running Locally

Want to spin this up on your own machine? Follow these steps.

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/CoMumbo/Shule-site.git
cd Shule-site
2. Backend Setup
bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend/ directory:

env
DEBUG=True
SECRET_KEY=your-super-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/school
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
Run migrations and start the server:

bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
3. Frontend Setup
Open a new terminal window:

bash
cd frontend
npm install
Create a .env file in the frontend/ directory:

env
VITE_API_URL=http://localhost:8000/api
Start the Vite development server:

bash
npm run dev
The app will be running at http://localhost:5173.

Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

<div align="center"> <i>Built with React, Django, and PostgreSQL by <a href="https://github.com/CoMumbo">Collins Mumbo</a></i> </div>
License
MIT License

Copyright (c) 2026 Collins Mumbo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.