# UNIS — Unified Network for Institutional Service

> **Enterprise Campus Services Management & Helpdesk Operations Platform**  
> Unified full-stack web application built with **Java 21 LTS (Spring Boot 3.3.4)**, **React 18 / Vite**, **Tailwind CSS**, and **MySQL 8.4**.

---

## 🏛️ Project Overview

**UNIS (Unified Network for Institutional Service)** connects students, academic department heads, and institutional administrators in a centralized, secure operations portal. Designed to replace fragmented campus service requests, UNIS provides real-time helpdesk ticketing, algorithmic complaint classification, duplicate issue prevention, lost-and-found property recovery with private claims moderation, departmental workload tracking, campus breakdown hotspot telemetry, and a constitutional administrator governance system.

---

## 🎨 Enterprise Visual Identity (Blue-Indigo-Violet)

UNIS features a modern SaaS visual design derived from the official UNIS institutional brand:

| Design Token | Hex Code | Purpose |
|---|---|---|
| **Deep Navy** | `#18264B` | Primary institutional headers, dark mode structural surfaces, strong contrasts |
| **Royal Blue** | `#315FEA` | Primary brand accent, interactive buttons, active links, primary charts |
| **Indigo** | `#5946D8` | Secondary brand accent, department-head badges, gradients, custom dropdowns |
| **Violet** | `#8465ED` | Accent highlights, administrator badges, subtle hover glow |
| **Light Blue Surface** | `#EAF0FF` | Selected card backgrounds, badge fills, active navigation items |
| **Light Violet Surface** | `#F0ECFF` | Department header tints, subtle pill accents |
| **Neutral Canvas** | `#F7F8FC` | Crisp, modern light mode page background |
| **Dark Theme Canvas**| `#101525` | Calming navy dark background (elevated cards: `#191F34`, borders: `#303A57`) |

### Key UI Characteristics
- **Responsive Layout**: Login and authentication cards utilize a fluid `min(94vw, 1240px)` desktop container preventing blank side borders on wide displays, with zero vertical scrolling on standard laptop displays.
- **Micro-Animations**: Smooth 150–200ms transitions adhering to accessibility standards (`prefers-reduced-motion`).
- **Accessible Custom Select Component**: Dropdown components featuring custom indigo styling, keyboard navigation (Escape, Enter, Arrow keys), ARIA accessibility attributes, and alphabetical ordering with *"Other"* anchored at the end.
- **Clean Aesthetic**: Elimination of redundant session labels, academic year text, or detached footer banners.

---

## 🔑 Local Development Credentials

> [!WARNING]
> **LOCAL DEVELOPMENT & DEMONSTRATION USE ONLY**  
> The credentials listed below are provisioned strictly for local development, grading, and demonstration testing. They **must never** be used in a production or publicly exposed environment. Plaintext passwords are never logged by the application, printed to the terminal, or stored unhashed in the database.

### 1. Student Login
- **Username / Email**: `Rahul@gmail.com`
- **Password**: `Rahul@123`
- **Department**: `Computer Engineering`
- **Status**: `Approved`
- **Account State**: `Active`
- **Login Mode & Page**: **Student Login** (`/login`)

### 2. Administrator Login
- **Username / Email**: `Admin@hotmail.com`
- **Password**: `Administrator@123`
- **Role**: `Administrator`
- **Designation**: `Founder Administrator` (`is_founder = true`)
- **Status**: `Active`
- **Login Mode & Page**: **Administrator Login** (`/login?mode=admin`)

### Usage Instructions
- **Student Services**: Use the default login page at `/login` with the student credentials above.
- **Administrator Access**: Use the top-right toggle button to switch to **Administrator Login** (`/login?mode=admin`) with the administrator credentials above.
- Attempting to use student credentials on Administrator Login or administrator credentials on Student Login is rejected with a generic security error to prevent account enumeration.

---

## 🔐 Authentication Modes & Security Boundaries

UNIS implements strict, role-segregated entry points on the authentication portal:

### 1. Student Login (`/login`)
- **Default Entry Point**: Geared toward students and departmental personnel.
- **Branding Header**: *UNIS — Unified Network for Institutional Service*.
- **Submit Button**: Concise `Sign in` action.
- **Role Validation**: Authenticates `STUDENT` and `DEPARTMENT_HEAD` accounts.
- **Boundary Enforcement**: If an administrator attempts to sign in via the Student Login form, the backend rejects the session before any security context or HTTP session is created.
- **Generic Security Message**: The frontend and backend return a generic error message:
  > *"Unable to sign in with the provided credentials. Check your details and try again."*
  This ensures no account existence or role information is leaked to unauthorized observers.

### 2. Administrator Login (`/login?mode=admin`)
- **Switching Modes**: Easily accessible via the top-right `Admin Login` toggle button on the login interface.
- **Branding Header**: *UNIS — Unified Network for Institutional Service*.
- **Submit Button**: Concise `Sign in` action.
- **Role Validation**: Strictly authenticates `ADMIN` accounts.
- **Boundary Enforcement**: If a student or non-administrator attempts to sign in via the Administrator Login form, the backend rejects the session before any security context is created.
- **Information Leakage Prevention**: Invalid credentials, non-existent accounts, and role mismatches all receive the exact same generic error message to prevent account enumeration and timing attacks.
- **Administrator Access Requests**: A professional link (*"Need administrator access? Register as an administrator"*) opens the institutional governance request dialog to submit formal access requests for review rather than allowing unauthenticated public administrator creation.

### 3. Strong Password Policy
Registration and password updates enforce a mandatory 5-point security checklist:
- Minimum **8 characters** in length
- At least **1 uppercase letter** (`A-Z`)
- At least **1 lowercase letter** (`a-z`)
- At least **1 number** (`0-9`)
- At least **1 symbol** (`!@#$%^&*()_+-=[]{}|;:,.<>?`)

*The registration form features a real-time reactive checklist that highlights each requirement as the user types.*

---

## 👥 Three-Role Permission Model

UNIS strictly implements three distinct roles:

```
                  ┌───────────────────────────────┐
                  │          UNIS ROLES           │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────┐         ┌─────────────────┐        ┌─────────┐
    │  ADMIN  │         │ DEPARTMENT_HEAD │        │ STUDENT │
    └─────────┘         └─────────────────┘        └─────────┘
```

### 1. `ADMIN` (Institutional Administration)
- Full institution-wide oversight across all departments, locations, and operations.
- Approve or reject pending student registrations across **any department**.
- Bulk-approve, bulk-reject, or manage student accounts across the institution.
- Manage academic departments, campus locations, and system accounts.
- Triage, reassign, and moderate any service ticket, announcement, or lost-and-found listing.
- Participate in Administrator Governance (governed by the 5-admin quota and removal proposal system).
- Inspect immutable institutional audit log records.

### 2. `DEPARTMENT_HEAD` (Academic Department Leadership)
- Strictly isolated to operational data belonging to their assigned academic department.
- Authenticate via the standard portal and route automatically to their departmental dashboard.
- Review and approve pending student registrations **only within their own department**.
- Bulk-approve or reject student registrations within their department.
- Triage department tickets, assign maintenance crew, and track SLA target deadlines.
- *Strictly restricted*: Cannot view, approve, or modify students belonging to other departments; cannot create or manage administrators.

### 3. `STUDENT` (Student Body)
- Public self-registration with compulsory department selection.
- Account is placed into `PENDING` approval state upon registration.
- Once approved by a Department Head or Admin, gains full student portal access:
  - Guided 4-step campus breakdown reporting wizard.
  - Personal helpdesk tickets with status timelines, discussion threads, and resolution surveys.
  - Campus Lost & Found directory, posting listings, and submitting private recovery claims.
  - Departmental and institutional announcements with real-time notification alerts.

---

## 📋 Student Registration & Approval Workflow

```
[Student Registers] ──► [Account: PENDING] ──► [Restricted to /pending-approval]
                                                            │
                     ┌──────────────────────────────────────┴──────────────────────────────────────┐
                     ▼                                                                             ▼
        [Department Head Approves]                                                        [Administrator Approves]
        (For matching department only)                                                    (For any department)
                     │                                                                             │
                     └──────────────────────────────┬──────────────────────────────────────────────┘
                                                    ▼
                                          [Account: APPROVED]
                                                    │
                                                    ▼
                                       [Full Student Portal Access]
```

1. **Registration Form**:
   - Requires full name (with professional fictional Indian name placeholders, e.g. *Aarav Sharma*), unique login email identifier, compliant password, and **compulsory department selection**.
   - Optional institutional email field.
   - Pre-configured with canonical engineering departments sorted alphabetically with *"Other"* anchored last:
     1. *Artificial Intelligence and Data Science*
     2. *Civil Engineering*
     3. *Computer Engineering*
     4. *Computer Technology*
     5. *Electrical Engineering*
     6. *Electronics and Telecommunication Engineering*
     7. *Information Technology*
     8. *Mechanical Engineering*
     9. *Other* (selecting *Other* reveals a required text input for custom department name).
2. **Pending Approval Gate**:
   - Newly registered students are stored with `APPROVED = false` and routed to `/pending-approval`.
   - The backend blocks ticket creation, claims, and protected student endpoints until approved.
3. **Approval Queues**:
   - Department Heads access `/students` filtered strictly to their department's pending queue.
   - Admins can filter by any department or view all pending students institution-wide.
   - Supports individual approval/rejection and bulk multi-select operations.

---

## ⚖️ Administrator Governance & Removal Protocol

To safeguard institutional integrity, UNIS implements a strict administrative governance architecture:

### 1. The 5-Administrator Cap
- There can be at most **5 active administrators** at any time.
- Only existing authorized administrators can create new administrators.
- If 5 active administrators already exist, creating a 6th administrator is rejected by the backend with an explicit quota error.
- Department Heads cannot create administrators or promote users to administrative rank.

### 2. Founder Administrator Designation
- The initial administrator account (`Admin@hotmail.com`) is explicitly recorded in the database with `is_founder = true`.
- **Founder Removal Protection**: The founder administrator **cannot be removed** or targeted by removal proposals from other administrators under any circumstances.

### 3. Removal Rules When < 5 Administrators Exist
- When fewer than 5 active administrators exist in the institution, **no administrator can remove another administrator**.
- Ordinary removal workflows and proposals are disabled.

### 4. Removal Protocol When Exactly 5 Administrators Exist
When the administrative board reaches its maximum capacity of 5 active administrators, administrator removal operates under a strict multi-signature proposal mechanism:
1. **Proposal Initiation**: Any non-target administrator can initiate a removal proposal against a non-founder administrator (e.g., Administrator A).
2. **Unanimous Approval Required (4/4 Non-Target Approvals)**:
   - For Administrator A to be removed, all **4 remaining administrators** (excluding target A) must explicitly approve the proposal.
   - The proposal creator counts as 1 approval.
   - The target administrator (A) cannot vote or approve their own removal proposal.
3. **Persistent Proposal Tracking**:
   - Each proposal records target ID, creator ID, status (`PENDING`, `APPROVED`, `CANCELLED`), required approval count (4), current approval tally, and individual approval audit logs.
4. **Execution & Access Revocation**:
   - Only when all 4 non-target approvals are recorded does the system transition the proposal to `APPROVED` and deactivate the target administrator (`active = false`).
   - The target's historical audit records and tickets are preserved (no cascade deletion).

### 5. Founder Voluntary Self-Revocation
- The founder administrator may voluntarily initiate their own retirement or departure.
- **Succession Safeguard**: The founder must designate an active successor administrator from the existing administrator pool.
- The system enforces that at least one viable active administrator remains before self-revocation completes.

---

## 📜 Audit Logging System

Every administrative action is immutably logged in MySQL:
- **Captured Metadata**: Actor user ID, actor role, action type (e.g., `CREATE_ADMIN`, `APPROVE_STUDENT`, `CREATE_REMOVAL_PROPOSAL`, `APPROVE_REMOVAL_PROPOSAL`), target entity type, target entity ID, outcome (`SUCCESS` / `FAILURE`), timestamp, and safe contextual details.
- **Privacy & Security**: Plaintext passwords, authentication tokens, and sensitive secrets are strictly excluded from audit payloads.
- **Administrator Audit Dashboard**: Accessible at `/admin/audit-logs` featuring real-time search, action filters, and pagination.

---

## 🚀 Launching UNIS via `run.java`

UNIS provides an optimized, cross-platform root launcher implemented in **Java 21**: [`run.java`](file:///d:/Siddhesh/Documents/Projects/UNIS/run.java).

### Prerequisites
- **Java**: JDK 21 LTS or newer (`java -version`)
- **Node.js**: v18.0.0 or newer with npm (`node -v`, `npm -v`)
- **MySQL**: 8.0 or newer running on `localhost:3306` with database `unis_db` (credentials `root:1234` or configured via environment variables)

### Command to Launch
From the root `UNIS/` folder, run:

```bash
java run.java
```

### What `run.java` Does Automatically:
1. **Directory Discovery**: Resolves the project root path reliably across operating systems.
2. **Environment Pre-flight**: Verifies MySQL connectivity on port 3306 and confirms `npm` availability.
3. **Smart Incremental Build**: Checks whether source files (`backend/src/**`, `pom.xml`) are newer than the packaged JAR. If the JAR is up to date, it launches immediately without running redundant Maven builds.
4. **Starts Spring Boot Backend**: Runs `backend/target/unis-backend-1.0.0.jar` on **port 8080** with live log streaming.
5. **Backend Readiness Polling**: Verifies `http://localhost:8080/api/auth/csrf` until Spring Boot is fully initialized.
6. **Starts Vite Dev Server**: Launches the frontend development server on **port 5173**.
7. **Frontend Readiness Polling**: Polls `http://localhost:5173/login` until the UI is responsive.
8. **Automated Browser Launch**: Detects Google Chrome on Windows and opens `http://localhost:5173/login` (gracefully falls back to system browser).
9. **Graceful Process Shutdown**: Press `q` + `Enter` or `Ctrl+C` to terminate both backend and frontend child processes cleanly without orphaned background ports.

*Optional Flags*:
```bash
# Force an incremental Maven rebuild before launch:
java run.java --build

# Force a clean Maven package build:
java run.java --clean

# Enable verbose raw build and framework log output:
java run.java --verbose
```

---

## 🛠️ Technology Stack & Architecture

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 (BCrypt password hashing, session cookies, method-level RBAC, CSRF token validation)
- **Data & Persistence**: Spring Data JPA, Hibernate 6, Jakarta Bean Validation
- **Database**: MySQL 8.4
- **Database Migrations**: Flyway (Flyway version 4):
  - `V1__init_schema.sql`: Core schema (users, departments, locations, tickets, lost_found, announcements, notifications, audit_logs)
  - `V2__seed_demo_data.sql`: Seed data
  - `V3__three_roles_and_student_approval.sql`: Migration adding 8 canonical departments, approval status columns, and removing obsolete roles.
  - `V4__founder_admin_and_governance.sql`: Adds `is_founder` and `created_by_id` columns, governance tables (`admin_removal_proposals`, `admin_removal_approvals`), and seeds initial demonstration accounts (`admin@hotmail.com` and `rahul@gmail.com`).

### Frontend
- **Framework**: React 18, Vite 5
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with enterprise Blue-Indigo-Violet design tokens
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **HTTP Client**: Axios with `/api` proxy routing and CSRF cookie synchronization

---

## 🧪 Automated Testing & Verification

The project includes an automated test suite verifying core business rules, authentication, and departmental isolation:

### Run Backend Tests:
```bash
mvn test
```
*Current test suite*: **26 tests run, 0 failures, 0 errors, BUILD SUCCESS.**
- `AuthenticationRulesTest`: Verifies password validation (8+ chars, upper, lower, digit, symbol), student vs admin login mode rejection, successful authentication, and safe generic failure messages.
- `AdminGovernanceTest`: Verifies founder protection, removal blocking when < 5 admins, 5-admin cap enforcement, and the full unanimous 4/4 non-target approval workflow.
- `StudentApprovalWorkflowTest`: Verifies student pending status, ticket creation restrictions for pending students, department head isolation, and cross-department admin approval.
- `SecurityIsolationTest`: Verifies RBAC restrictions across roles.

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```
*Current build status*: **Zero errors. Successfully bundles all production components into `frontend/dist/`.**

---

## 🗄️ Database Reset & Configuration

### Standard Configuration
Connection properties are located in `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/unis_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: ${DB_PASSWORD:1234}
```

### Resetting the Development Database

> [!CAUTION]
> **DESTRUCTIVE OPERATION**  
> Running a database reset will drop all tables and erase all stored tickets, users, announcements, and audit records in `unis_db`. Execute this only in local development environments!

To completely reset the database to a fresh state with Flyway migrations:

1. Stop any running backend instances.
2. Open your MySQL client (e.g. MySQL Command Line Client, Workbench, or PowerShell):
   ```sql
   DROP DATABASE IF EXISTS unis_db;
   CREATE DATABASE unis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Run the backend or execute Flyway migrations:
   ```bash
   cd backend
   mvn flyway:migrate
   ```
   Or start the application via `java run.java`. Flyway will automatically execute migrations `V1` through `V4`, creating all tables and provisioning the initial demo accounts (`admin@hotmail.com` and `rahul@gmail.com`).

---

## 📁 Repository Structure

```
UNIS/
├── README.md                 # Single comprehensive documentation file
├── run.java                  # Root Java 21 application launcher
├── mvn.cmd                   # Maven wrapper
├── docker-compose.yml        # Docker compose configuration for MySQL
├── .gitignore                # Git ignore configuration
├── .env.example              # Sample environment configuration
├── backend/                  # Spring Boot application
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/unis/
│       │   ├── UnisApplication.java
│       │   ├── auth/         # Authentication & Login Mode validation
│       │   ├── config/       # Security, CORS, Audit configurations
│       │   ├── governance/   # Admin Governance & Removal Proposals
│       │   ├── user/         # User entity & quota enforcement
│       │   ├── ticket/       # Helpdesk ticketing & classification
│       │   ├── lostfound/    # Lost & Found listings and moderation
│       │   ├── announcement/ # Institutional announcements
│       │   └── audit/        # MySQL Audit Logging
│       └── main/resources/
│           ├── application.yml
│           └── db/migration/ # Flyway SQL migrations (V1, V2, V3, V4)
└── frontend/                 # React Vite application
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── api/              # Axios HTTP client
        ├── assets/           # Official UNIS logo asset
        ├── components/       # CustomSelect, Modals, Navbar
        ├── context/          # Auth, Theme, and Notification contexts
        ├── layouts/          # AuthLayout (1240px responsive) & AppLayout
        ├── pages/            # Login, Register, Governance, Tickets
        └── routes/           # Role guards & protected routes
```

---

## 🔧 Troubleshooting & FAQ

### 1. `Port 8080 or 5173 is already in use`
- Identify the process holding the port:
  ```powershell
  netstat -ano | findstr :8080
  netstat -ano | findstr :5173
  ```
- Terminate the conflicting process using `taskkill /PID <PID> /F`.

### 2. `Could not connect to MySQL database at localhost:3306`
- Verify that MySQL service is running:
  ```powershell
  Get-Service MySQL*
  # If stopped:
  Start-Service MySQL84
  ```
- Ensure the database `unis_db` exists (`CREATE DATABASE unis_db;`).

### 3. `Java 21 Compiler or Bytecode Errors`
- Ensure `JAVA_HOME` points to JDK 21 or newer:
  ```powershell
  $env:JAVA_HOME
  java -version
  ```
- If Maven defaults to an older JDK, configure `mvn.cmd` or set your environment `JAVA_HOME` path to your JDK 21 installation.
