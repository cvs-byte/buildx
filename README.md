<<<<<<< HEAD
# AcademyGrowth — Multi-Tenant Education Management SaaS Platform

AcademyGrowth is an enterprise multi-tenant React + TypeScript SaaS frontend built for educational institutions (schools, colleges, universities, and educational networks).

It communicates with the production API Gateway at:
`https://api.academygrowth.in/v1`

---

## 🌟 Key Architecture Features

1. **Strict 6-Tier Role Hierarchy (RBAC)**:
   ```
   SYSTEM ADMIN ➔ COLLEGE ADMIN ➔ PRINCIPAL ➔ ADMIN ➔ TEACHER ➔ STUDENT
   ```

2. **Centralized Permission Evaluator (`src/utils/permissions.ts`)**:
   - Granular permission checks (`hasPermission(user, permission)`).
   - Route protection guards (`PermissionGuard.tsx`).

3. **Multi-Tenant Isolation**:
   - Headers injected automatically: `X-Tenant-Id: <tenant_id>` and `Authorization: Bearer <jwt_token>`.

4. **Strict Scope Data Privacy**:
   - **Student Portal**: Access restricted exclusively to personal attendance, schedule, published grades, and official PDF report card download.
   - **College Admin Portal**: Full CRUD over Principals, Teachers, Timetable Conflict Scheduling, Class Organization, and Attendance Mode Settings (`PERIOD_WISE` vs `DAY_WISE`).
   - **System Admin Portal**: Platform-wide tenant management, College Admin provisioning, and system audit logs.

5. **Official Result PDF Downloader**:
   - PDF generator button triggering official transcript formatting.

---

## 📁 Project Structure

```
academygrowth/
├── docs/                     # Architecture, RBAC, and REST API contract documentation
│   ├── api-contract.md
│   ├── architecture.md
│   └── rbac.md
├── public/
├── src/
│   ├── api/                  # REST API Service Modules
│   │   ├── client.ts         # Central fetch wrapper with tenant headers & interceptors
│   │   ├── auth.api.ts
│   │   ├── tenant.api.ts
│   │   ├── user.api.ts
│   │   ├── timetable.api.ts
│   │   ├── classGroup.api.ts
│   │   ├── attendance.api.ts
│   │   ├── leave.api.ts
│   │   └── notifications.api.ts
│   ├── components/           # Reusable UI Primitives & Modals
│   │   ├── common/
│   │   ├── forms/
│   │   ├── pdf/
│   │   ├── AbsenteesList.tsx
│   │   ├── AttendanceConfigForm.tsx
│   │   └── TeacherAttendanceStatus.tsx
│   ├── contexts/             # AuthContext, TenantContext, ToastContext
│   ├── hooks/                # useAuth, useTenant, useUsers, useToast
│   ├── pages/                # Gated Role Pages (admin, collegeAdmin, principal, teacher, student)
│   ├── routes/               # AppRoutes, ProtectedRoute & PermissionGuard
│   ├── types/                # TypeScript Interface Models
│   ├── utils/                # Permissions, Storage, Formatters, Constants
│   ├── App.tsx
│   ├── index.css             # Glassmorphic Theme System
│   └── main.tsx
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env`:
```bash
VITE_API_BASE_URL=https://api.academygrowth.in/v1
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License
Created for AcademyGrowth Education SaaS Platform. All rights reserved.
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
>>>>>>> 92dca00f69fc82875f648e889ae1075c4df64d30
