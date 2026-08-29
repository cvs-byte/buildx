# AcademyGrowth — Multi-Tenant Education Management SaaS Platform

AcademyGrowth is a modern **multi-tenant Education Management SaaS Platform** built with React, TypeScript, and Vite.

The platform is designed to support **schools, colleges, universities, and educational institutions** with centralized management of students, teachers, classes, attendance, timetables, results, and role-based access.

The project also includes a **production-ready QR-based attendance system** that allows teachers to scan student QR codes directly from the Teacher Dashboard.

---

## 🌟 Project Overview

AcademyGrowth provides separate experiences for different users while maintaining strict role-based access and tenant isolation.

```text
SYSTEM ADMIN
      ↓
COLLEGE ADMIN
      ↓
PRINCIPAL
      ↓
ADMIN
      ↓
TEACHER
      ↓
STUDENT
```

Each role receives only the features and data permitted by its responsibilities.

---

## 🚀 Live Architecture

### Frontend

Built using:

* React
* TypeScript
* Vite
* Modern responsive UI
* Component-based architecture
* Role-based route protection

### Backend

The frontend communicates with the production backend through:

```text
https://api.academygrowth.in/v1
```

Architecture:

```text
React + TypeScript
        ↓
Centralized API Client
        ↓
API Gateway
        ↓
Backend Services
        ↓
Database
```

---

# ✨ Key Features

## 🔐 Role-Based Access Control

AcademyGrowth implements a six-level role hierarchy:

| Role          | Main Responsibility                  |
| ------------- | ------------------------------------ |
| System Admin  | Platform-wide management             |
| College Admin | Institution management               |
| Principal     | Academic and institutional oversight |
| Admin         | Administrative operations            |
| Teacher       | Classes, students and attendance     |
| Student       | Personal academic information        |

The application uses centralized permission evaluation and protected routes.

---

## 🏫 Multi-Tenant Architecture

AcademyGrowth is designed as a multi-tenant platform.

Each institution operates within its own tenant context.

Authenticated API requests can include:

```http
Authorization: Bearer <JWT>
X-Tenant-Id: <tenant_id>
```

This architecture helps ensure that users only access data belonging to their authorized institution and scope.

---

# 👨‍🏫 Teacher Dashboard

The Teacher Dashboard provides teachers with tools required for everyday classroom operations.

### Features

* Teacher profile
* Dashboard overview
* Class management
* Student management
* Timetable
* Attendance
* QR attendance scanning
* Leave management
* Notifications

---

# 📷 QR-Based Attendance

One of the main features of AcademyGrowth is the **QR Attendance Scanner**.

Teachers can use their device camera to scan student QR codes.

### Workflow

```text
Teacher Dashboard
       ↓
Attendance
       ↓
Open QR Scanner
       ↓
Camera
       ↓
Scan Student QR
       ↓
Decode Student ID
       ↓
Validate Student
       ↓
Verify Class & Section
       ↓
Check Existing Attendance
       ↓
Mark Attendance
       ↓
Backend Confirmation
       ↓
Success
```

The scanner provides a modern camera experience inspired by **Google Lens-style scanning interfaces**.

### Scanner Features

* Real device camera access
* Rear camera preference on mobile
* Continuous QR detection
* Scanning frame
* Scanning animation
* Camera permission handling
* Camera switching
* Flash support where available
* Duplicate scan protection
* Student validation
* Class and section validation
* Attendance confirmation
* Network error handling
* Camera error handling
* Mobile-friendly interface

Attendance is considered successful **only after confirmation from the backend**.

---

# 👨‍🎓 Student Dashboard

The Student Dashboard provides students with access to their own academic information.

### Features

* Personal dashboard
* Attendance
* Timetable
* Published results
* Report card
* Notifications
* Profile

Students are restricted from accessing administrative functionality or other students' private information.

---

# 📊 Attendance Management

Teachers can manage attendance for their assigned classes.

The system supports:

* Student attendance
* Attendance dates
* Class and section selection
* Attendance status
* QR-based attendance
* Duplicate attendance prevention
* Attendance summaries

The platform is designed to support configurable attendance modes such as:

```text
PERIOD_WISE
DAY_WISE
```

---

# 📚 Timetable Management

AcademyGrowth provides timetable functionality for educational institutions.

The system is designed to support:

* Class schedules
* Teacher schedules
* Subject schedules
* Section-based scheduling
* Timetable organization
* Conflict-aware scheduling

---

# 📝 Results & Report Cards

Students can access published academic results through their dashboard.

The platform also supports generation/download of an official report card or transcript PDF.

The student can only access their authorized academic records.

---

# 🔔 Notifications

The platform includes notification functionality for communicating important information to users.

Notifications can be integrated with role-specific dashboards so that users receive relevant updates.

---

# 🔒 Security & Privacy

AcademyGrowth follows a layered security architecture.

```text
Authentication
      +
JWT Authorization
      +
Tenant Isolation
      +
Role-Based Access Control
      +
Permission Evaluation
      +
Protected Routes
      +
Backend Authorization
```

The frontend does not act as the final security boundary.

The backend must independently validate authentication, authorization, tenant scope, and requested resources.

---

# 🧩 Project Structure

```text
academygrowth/
│
├── docs/
│   ├── api-contract.md
│   ├── architecture.md
│   └── rbac.md
│
├── public/
│
├── src/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── tenant.api.ts
│   │   ├── user.api.ts
│   │   ├── timetable.api.ts
│   │   ├── classGroup.api.ts
│   │   ├── attendance.api.ts
│   │   ├── leave.api.ts
│   │   └── notifications.api.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── pdf/
│   │   ├── AbsenteesList.tsx
│   │   ├── AttendanceConfigForm.tsx
│   │   └── TeacherAttendanceStatus.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── TenantContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useUsers.ts
│   │   └── useToast.ts
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── collegeAdmin/
│   │   ├── principal/
│   │   ├── teacher/
│   │   └── student/
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PermissionGuard.tsx
│   │
│   ├── types/
│   │
│   ├── utils/
│   │   ├── permissions.ts
│   │   ├── storage.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── package.json
└── README.md
```

---

# ⚙️ Environment Configuration

Create a `.env` file using `.env.example`.

```env
VITE_API_BASE_URL=https://api.academygrowth.in/v1
```

The frontend uses the centralized API client to communicate with the backend.

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* HTML5
* CSS3
* JavaScript
* Browser Camera APIs
* QR Code scanning technology

### Backend Integration

* REST API
* API Gateway
* JWT Authentication
* Multi-tenant request handling

### Development

* Git
* GitHub
* npm
* Vite development server

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/cvs-byte/buildx.git
cd buildx
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment

Create:

```text
.env
```

and add:

```env
VITE_API_BASE_URL=https://api.academygrowth.in/v1
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Build for Production

```bash
npm run build
```

---

# 🧪 Demo Accounts

The following accounts are provided for project evaluation and demonstration.

## Teacher Account

```text
Email: buildxteacher@gmail.com
Password: Buildx@123
Role: TEACHER
```

Teacher dashboard:

```text
/teacher
```

The teacher account can be used to demonstrate:

* Teacher dashboard
* Student management
* Attendance
* QR scanner
* Class/section attendance workflows

---

## Student Account

```text
Email: buildxstudent@gmail.com
Password: Buildx@123
Role: STUDENT
```

Student dashboard:

```text
/student
```

The student account can be used to demonstrate:

* Student dashboard
* Personal attendance
* Timetable
* Results
* Report card
* Notifications

> **Note:** These credentials are demo/evaluation credentials for the BuildX project. They should not be reused for production accounts.

---

# 🔗 API

Production API base:

```text
https://api.academygrowth.in/v1
```

The frontend uses a centralized API layer rather than making uncontrolled API requests directly from individual components.

Primary service modules include:

```text
Authentication
Users
Tenants
Classes
Timetable
Attendance
Leave
Notifications
```

---

# 📱 Responsive Design

AcademyGrowth is designed for:

* Desktop
* Laptop
* Tablet
* Android phones
* iPhones

The QR scanner is especially optimized for mobile devices because teachers can use their phone cameras to scan student QR codes.

---

# 🛡️ Error Handling

The application handles common production scenarios including:

* Invalid login
* Expired authentication
* Unauthorized access
* Network failure
* API failure
* Camera permission denial
* Camera unavailable
* Invalid QR code
* Student not found
* Wrong class/section
* Duplicate attendance
* Server errors

The application provides user-friendly error states rather than exposing internal backend errors.

---

# 🎯 Project Goals

AcademyGrowth aims to provide educational institutions with a unified platform for managing:

```text
Students
   +
Teachers
   +
Classes
   +
Attendance
   +
Timetables
   +
Results
   +
Report Cards
   +
Notifications
```

The long-term architecture is designed to support multiple institutions from a single SaaS platform while maintaining strict tenant and role isolation.

---

# 📈 Future Enhancements

Potential future improvements include:

* Parent portal
* Online fee management
* Examination management
* Assignment management
* Digital ID cards
* Advanced analytics
* AI-powered academic insights
* Automated notifications
* Mobile applications
* Biometric attendance integration
* Institution-level reporting
* Advanced audit logs

---

# 👨‍💻 Project

**AcademyGrowth — Multi-Tenant Education Management SaaS Platform**

Repository:

```text
https://github.com/cvs-byte/buildx
```

Production API:

```text
https://api.academygrowth.in/v1
```

---

# 📄 License

Created for the **AcademyGrowth Education SaaS Platform**.

All rights reserved.
