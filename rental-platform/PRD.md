# Product Requirements Document (PRD)

## Almora Zila Panchayat — Rental Management System

| Field                    | Detail                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Document Version**     | 1.0                                                                                                         |
| **Status**               | Draft / Project Baseline                                                                                    |
| **Primary Organization** | Almora Zila Panchayat                                                                                       |
| **Expected Initial Scale** | 200 – 1,000 users                                                                                        |
| **Languages**            | Hindi + English                                                                                             |
| **Hosting**              | AWS                                                                                                         |
| **Frontend**             | React / Next.js                                                                                             |
| **Backend**              | Node.js + Express.js                                                                                        |
| **Database**             | PostgreSQL                                                                                                  |
| **Online Payment**       | Razorpay or approved payment gateway                                                                        |
| **Next Stage**           | UI/UX Design → Database Design → API Design → Development → Testing → Security Testing → Deployment        |

> **Note:** Items marked **[Subject to final approval by Almora Zila Panchayat]** are configurable and represent recommendations rather than confirmed policy.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Objectives](#2-project-objectives)
3. [Scope](#3-scope)
4. [User Roles](#4-user-roles)
5. [Public Website](#5-public-website)
6. [Authentication & Account Management](#6-authentication--account-management)
7. [User Profile Management](#7-user-profile-management)
8. [Property / Shop Management](#8-property--shop-management)
9. [Rent Management](#9-rent-management)
10. [Previous Unpaid Rent](#10-previous-unpaid-rent)
11. [Payment Allocation](#11-payment-allocation)
12. [Payment Management](#12-payment-management)
13. [Ledger Management](#13-ledger-management)
14. [Financial Year Support](#14-financial-year-support-recommended)
15. [Receipt Management](#15-receipt-management)
16. [Notice Management](#16-notice-management)
17. [Complaint Management](#17-complaint-management)
18. [Feedback Management](#18-feedback-management)
19. [Notifications](#19-notifications)
20. [Dashboards](#20-dashboards)
21. [Reports](#21-reports)
22. [Search, Filter & Export](#22-search-filter--export)
23. [Audit Logs](#23-audit-logs)
24. [Login Activity](#24-login-activity)
25. [Security Requirements](#25-security-requirements)
26. [AWS Hosting Requirements](#26-aws-hosting-requirements)
27. [Environment Management](#27-environment-management)
28. [Backup & Recovery](#28-backup--recovery)
29. [Data Integrity](#29-data-integrity)
30. [Soft Delete / Archive](#30-soft-delete--archive-recommended)
31. [Activity Timeline](#31-activity-timeline-recommended)
32. [Global Search](#32-global-search-recommended)
33. [Internationalization / Language](#33-internationalization--language)
34. [Non-Functional Requirements](#34-non-functional-requirements)
35. [Suggested Technical Architecture](#35-suggested-technical-architecture)
36. [Core Data Entities](#36-core-data-entities)
37. [Key Business Rules](#37-key-business-rules)
38. [MVP Scope](#38-mvp-scope)
39. [Phase 2 / Future Enhancements](#39-phase-2--future-enhancements)
40. [Acceptance Criteria](#40-acceptance-criteria)
41. [Documentation Deliverables](#41-documentation-deliverables)
42. [Final Product Vision](#42-final-product-vision)

---

## 1. Project Overview

The Almora Zila Panchayat Rental Management System is a secure, web-based platform for managing Zila Panchayat rental properties, shops, tenants/users, monthly rent, payments, ledgers, receipts, notices, complaints, reports, and administrative activity.

The platform provides three authenticated roles — **Super Admin**, **Sub Admin**, and **User/Tenant** — alongside a separate public website that shares general information without exposing private tenant or financial data. Hindi and English are supported throughout the public site and all authenticated panels.

---

## 2. Project Objectives

- Digitize rental/property management and maintain centralized tenant and property records
- Automate monthly rent generation and track paid/unpaid rent
- Support both online and offline/cash payments
- Maintain user-wise and property-wise ledgers, and generate official receipts
- Manage public and individual notices, and complaints with status tracking
- Provide dashboards, reports, and complete administrative/user activity logs
- Improve security, transparency, and record traceability
- Provide a scalable architecture suitable for future expansion

---

## 3. Scope

### 3.1 In Scope

Public website · admin & user authentication · OTP verification · password setup/reset · Super Admin, Sub Admin and User/Tenant management · property/shop management and allotment · monthly rent management and revision history · previous dues management · online and offline payment management and allocation · ledger management · receipt generation · public and individual notices · complaints · feedback · SMS and in-app notifications · dashboards · reports · search/filter/export · audit logs · login activity logs · Hindi/English localization · AWS deployment · security controls · backup and recovery.

### 3.2 Out of Scope / Future Phases

WhatsApp notifications · advanced analytics and BI dashboards · automated penalty/late-fee rules · WAF deployment · advanced security monitoring · additional payment gateways · additional departments/districts · mobile applications · advanced document workflows.

---

## 4. User Roles

### 4.1 Super Admin

The highest-level administrative account, predefined securely in the database at initial setup (not created via any registration form).

**Permissions:** full dashboard and user visibility; create, update, activate/deactivate users; manage and assign properties; manage and modify rent, with visibility into rent history; manage payments including offline entries; view ledgers; generate/view receipts; create public and individual notices; manage complaints; view and export reports; view audit logs and login activity; manage system settings where permitted; **create, activate and deactivate Sub Admins.**

### 4.2 Sub Admin

Created only by the Super Admin. Performs the same operational administrative tasks as the Super Admin — user, property, rent, payment, ledger, receipt, notice and complaint management; reports; audit/log viewing; operational dashboard access.

**Restrictions:** cannot create another Admin/Sub Admin; cannot alter the Super Admin hierarchy. All other operational permissions mirror the Super Admin unless the final permission matrix changes. **[Subject to final approval]**

### 4.3 User / Tenant

An authorized tenant associated with exactly one property/shop.

**Can:** log in; view own profile, assigned property, monthly rent, current and previous dues; pay eligible rent; view payment history and ledger; download/view receipts; view individual and public notices; receive notifications; submit and track complaints; submit feedback.

**Cannot:** edit their own profile; change assigned property or rent amount; view another user's data or any administrative data; create users or admins; modify payments or ledger records. Profile changes require an authorized administrator.

### 4.4 Public Visitor

No account required. Can access Home, About Us, Rental/Properties, Notices, Documents, Feedback, Contact Us, and Sign In. Private tenant information, payment data, ledgers, and internal administrative data are never publicly accessible.

---

## 5. Public Website

| Page                 | Content                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Home**             | Organization and system introduction, announcements, latest public notices, quick links, contact |
| **About Us**         | Almora Zila Panchayat and rental/property management information                                |
| **Rental/Properties**| Publicly permitted property data — number, location, type, area, occupancy (private data excluded)|
| **Notices**          | Public/general notices                                                                           |
| **Documents**        | Publicly available documents and guidelines                                                      |
| **Feedback**         | Public feedback submission form                                                                  |
| **Contact Us**       | Office address, contact numbers, email, other official contacts                                  |
| **Sign In**          | Entry point to authenticated user/admin portals                                                  |

---

## 6. Authentication & Account Management

**No self-registration.** All user accounts are created by an administrator; the registered mobile number is used for authentication and OTP verification.

**First-time login flow:**

```
Admin creates User → Registered Mobile Number → OTP → OTP Verification
→ Set Password → Password Hash Stored → Normal Login
```

**Normal login:** `Mobile Number + Password → Authentication → User/Admin Dashboard`

**Forgot password:** `Mobile Number → OTP → OTP Verification → New Password → Password Hash → Password Updated`

Passwords are never stored in plaintext. **Argon2id** is preferred for hashing; bcrypt may be used if the implementation requires it.

**Admin MFA/2FA:** Multi-factor authentication should be enabled for all administrative accounts, using a second factor appropriate to the final security architecture. **[Subject to final approval]**

---

## 7. User Profile Management

**Profile fields:** User ID · Full Name · Father/Husband Name · Mobile Number · Email (if required) · Address · PAN Number · GST Number (optional) · Profile Picture · Property ID · Shop Number and address · Monthly Rent · Account Status · Joining/Allotment Date. *(Agreement details are out of current scope.)*

**Rules:** One user holds exactly one assigned property/shop; the user cannot edit their own profile — only an authorized admin can; sensitive fields are access-controlled.

---

## 8. Property / Shop Management

**Property fields:** Property ID · Shop/Property Number · Location · Property Type · Area (if required) · Monthly Rent · Occupancy Status · Assigned User · other official information. Status is at minimum `Vacant` / `Occupied` / `Inactive`.

### 8.1 Assignment

One property per user; the system must prevent conflicting/duplicate assignments.

### 8.2 Allotment History (Recommended)

Historical tenant–property relationships are preserved, not deleted:

```
Shop 12 → Tenant A → Tenant B → Tenant C
```

Each record captures property, previous user, new user, assignment date, end date, changed by, and timestamp.

---

## 9. Rent Management

### 9.1 Assignment

Monthly rent is set by an authorized administrator at user creation/property assignment (e.g., Manish → ₹1,200/month, Deepal → ₹1,000/month).

### 9.2 Automatic Monthly Generation

The system generates the applicable monthly rent record automatically and must prevent duplicate generation for the same user and period (e.g., Sep–Nov 2026 → ₹1,200 each).

### 9.3 Rent Modification

Authorized admins can modify rent; every change is preserved in a **Rent Revision History** recording old rent, new rent, effective-from/to dates, changed-by, timestamp, and reason (if required). Historical rent stays tied to its historical period.

---

## 10. Previous Unpaid Rent

The system clearly identifies unpaid prior periods (e.g., Jan → Paid, Feb–Mar → Unpaid, Apr → Current). Where a sequential-settlement rule applies, the user clears Feb → Mar → Apr in order before the account is considered current. **The enforcement rule requires final business-rule approval. [Subject to final approval]**

---

## 11. Payment Allocation

Payments are allocated against eligible rent periods, oldest-first, with duplicate allocation prevented and every allocation traceable in the ledger.

*Example:* Outstanding June–August = ₹1,200 each; a ₹2,400 payment fully settles June and July, leaving August outstanding.

---

## 12. Payment Management

### 12.1 Online Payment

```
User → Select Rent → Create Payment Order → Payment Gateway → Payment
→ Backend Verification → Payment Record → Ledger Update
→ Receipt Generation → Notification
```

The backend must verify every payment server-side (Payment ID, Order ID, signature, amount, currency, webhook/event data as applicable to the selected gateway). Frontend success alone is never treated as proof of payment.

### 12.2 Offline / Cash Payment

```
User gives cash → Authorized Admin → Creates Payment Entry
→ Ledger Updated → Receipt Generated
```

All manual entries are fully audited.

### 12.3 Payment Idempotency

The system prevents duplicate payment records arising from duplicate gateway callbacks, webhook retries, user refresh, network retries, or repeated requests.

---

## 13. Ledger Management

Maintained user-wise and property-wise.

**Fields:** Date · Rent Period · Particular · Debit · Credit · Balance · Payment Reference · Payment Method · GST details (if applicable) · Applicable Period From/To · Created By · Updated By.

| Date       | Period   | Particular     | Debit  | Credit | Balance |
| ---------- | -------- | -------------- | ------ | ------ | ------- |
| 01-09-2026 | Sep-2026 | Rent Generated | ₹1,200 | —      | ₹1,200  |
| 05-09-2026 | Sep-2026 | Payment        | —      | ₹1,200 | ₹0      |

**Rules:** No silent deletion of financial records; corrections use adjustment/reversal entries; history remains traceable; ledger updates are transactional and stay consistent with payment records.

---

## 14. Financial Year Support (Recommended)

Supports Indian financial years (e.g., FY 2025–26, 2026–27, 2027–28); reports and ledger exports are filterable by financial year.

---

## 15. Receipt Management

Generated after every verified successful payment.

**Contains:** Organization details, Receipt Number, tenant name and ID, property/shop number, rent period, amount, payment date and method, transaction/reference number, GST details where applicable.

**Numbering (recommended):** `AZP/RENT/2026/000001`, sequential and unique. Receipt files are never exposed through predictable public URLs.

---

## 16. Notice Management

- **General / Public Notice** — visible to public visitors (where applicable) and all authenticated users; may appear on Home, Notices, and the user's notification area.
- **Individual Notice** — sent to one specific user only (`Admin → Select User → Create Notice → Selected User Only`); inaccessible to other users.
- **Attachments** — PDF, JPG, JPEG, PNG, subject to file-upload security controls (Section 25).

---

## 17. Complaint Management

**Fields:** Complaint ID · User · Property/Shop · Subject · Description · Attachment · Date/Time · Status · Admin Remarks · Resolution Information.

**Status values (recommended):** `Pending` → `In Progress` → `Resolved` → `Closed`. Users track their own complaint status; admins manage status transitions.

---

## 18. Feedback Management

Available via the public website and the authenticated user portal. Exact workflow to be finalized during UI/UX and business-rule approval. **[Subject to final approval]**

---

## 19. Notifications

Supports **SMS** and **in-app** notifications for events such as: rent generated, payment successful/failed, important public or individual notices, complaint status updates, and other approved system events. SMS is sent only through an approved provider.

---

## 20. Dashboards

### 20.1 Admin Dashboard

Total/occupied/vacant properties, total users, monthly rent generated and collected, outstanding rent, paid vs. unpaid, online vs. offline payments, pending complaints, recent payments and notices — filterable by month, financial year, property, user, payment status, and payment method.

### 20.2 User Dashboard

Assigned property, monthly rent, current outstanding, previous dues, payment status, recent payments, latest receipt, ledger summary, notices, notifications, complaint status.

---

## 21. Reports

- Monthly Rent Collection
- Yearly Collection (by FY)
- User-Wise
- Property-Wise
- Payment Report
- Ledger Report
- Complaint Report
- GST-Related Report (where applicable)

Each report covers the relevant fields detailed in the source specification (amounts, dates, statuses, references).

---

## 22. Search, Filter & Export

Administrators can search/filter by User ID, User Name, Mobile Number, Property ID, Shop Number, Receipt Number, Payment Reference, or Complaint ID, and export results to **PDF** or **Excel/CSV**. All export access follows role-based permissions.

---

## 23. Audit Logs

**Fields:** Actor/User · Role · Action · Module · Target Record · Old/New Value · Timestamp · IP Address · Request/Reference ID.

**Logged events include:** user and property CRUD, rent changes, online/offline payment recording, notice creation, complaint updates, admin creation/deactivation, login success/failure, OTP requests/verification, password resets, MFA events, and security-configuration changes.

> ⚠️ **Passwords, OTPs, authentication tokens and other secrets must never be logged.**

---

## 24. Login Activity

Records successful/failed logins, logouts, OTP requests/verification, password resets, and MFA success/failure. The system should support monitoring for suspicious repeated authentication attempts.

---

## 25. Security Requirements

| Domain              | Requirements                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**  | Secure password hashing (Argon2id/bcrypt), OTP verification, admin MFA/2FA, secure session/token handling, rate limiting/lockout                                                    |
| **Authorization**   | Enforced entirely on the backend — the frontend is never a security boundary (User → own data only; Sub Admin → operational admin data; Super Admin → full admin data + admin creation) |
| **API Security**    | Authentication and role-based authorization middleware, input validation, rate limiting, secure HTTP headers, CORS restrictions, request size limits, secure error handling            |
| **Database Security** | Restricted PostgreSQL access, strong credentials, encrypted connections and backups, least-privilege DB users, transactional financial operations                                  |
| **File Uploads**    | Explicit allowed types, extension/MIME validation, size limits, randomized filenames, secure storage, access control, malware scanning where feasible, no executable uploads          |
| **Payment Security** | Official gateway integration, server-side verification, duplicate-transaction prevention, no storage of card/CVV/banking credentials, gateway references recorded, manual payments audited |
| **Transport**       | HTTPS/TLS enforced in production                                                                                                                                                    |
| **Secrets**         | Never stored in source code or committed to GitHub; managed via an appropriate secrets-management solution                                                                          |

---

## 26. AWS Hosting Requirements

```
User → HTTPS → Frontend → Backend/API → PostgreSQL → Secure Storage / Backups
```

Candidate AWS services (final architecture documented separately): EC2/ECS or other compute, RDS PostgreSQL, S3 for secure documents, CloudWatch for monitoring/logging, IAM for access management, Secrets Manager, CloudTrail, backup services, load balancer/CDN where required, and WAF as a future/approved layer.

---

## 27. Environment Management

```
Development → Staging → Production
```

Kept strictly separate. Production credentials and data are never used casually in development.

---

## 28. Backup & Recovery

Automated backups with a defined retention policy, secure backup storage, periodic recovery testing, and a documented disaster-recovery procedure. **Final RPO/RTO values to be confirmed with the organization. [Subject to final approval]**

---

## 29. Data Integrity

Consistency is maintained across users, properties, rent records, payments, ledger, and receipts. Financial operations use database transactions where required; deleting financial history is not permitted through normal UI operations.

---

## 30. Soft Delete / Archive (Recommended)

Important records (users, properties, admin accounts) prefer deactivation/archive (`Active → Inactive → Archived`) over permanent deletion, preserving historical records.

---

## 31. Activity Timeline (Recommended)

A human-readable, chronological timeline on each user profile (e.g., rent generated → payment received → receipt generated → notice issued) helps administrators review account history at a glance.

---

## 32. Global Search (Recommended)

A centralized admin search across Users, Properties, Payments, Receipts, Complaints, and Notices, with results still filtered by the searcher's authorization.

---

## 33. Internationalization / Language

Hindi and English are supported across the entire application — navigation, buttons, forms, validation and error messages, notifications, notices (where translated content is provided), dashboard labels, reports, and receipts where applicable. The language switch behaves consistently system-wide.

---

## 34. Non-Functional Requirements

- **Performance** — responsive at the expected 200–1,000 user scale
- **Scalability** — architecture allows future growth without a full rewrite
- **Availability** — production infrastructure designed for reliable uptime appropriate to organizational needs
- **Maintainability** — modular architecture, clear folder structure, reusable components, environment configuration, API documentation, database migrations, proper error handling
- **Accessibility** — public website and major forms follow appropriate accessibility practices
- **Responsive Design** — public site and user portal support desktop, tablet, and mobile; the admin portal targets desktop/tablet while remaining usable on smaller screens

---

## 35. Suggested Technical Architecture

A **modular monolith** is recommended over microservices/Kubernetes at this scale.

| Layer        | Technology                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Frontend** | React / Next.js — responsive UI, Hindi/English localization, role-based UI                        |
| **Backend**  | Node.js + Express.js — REST API, auth/authorization middleware, validation, rate limiting, audit   |
| **Database** | PostgreSQL                                                                                        |
| **Storage**  | AWS S3 (or equivalent) for documents/receipts                                                     |
| **Payments** | Razorpay or another approved gateway                                                              |
| **Hosting**  | AWS                                                                                               |

---

## 36. Core Data Entities

Admin · User/Tenant · Property · Property Assignment History · Rent · Rent Revision · Rent Period · Payment · Payment Allocation · Ledger Entry · Receipt · Notice · Complaint · Feedback · Notification · Audit Log · Login Activity · Document/File · System Settings.

*The final database schema will be produced during technical design.*

---

## 37. Key Business Rules

- Users cannot self-register; accounts are admin-created
- The Super Admin is predefined initially; only the Super Admin can create Sub Admins, who cannot create further admins
- All admins share operational permissions unless the final matrix changes **[Subject to approval]**
- One user holds exactly one property/shop; the profile is admin-editable only
- Rent is admin-assigned, auto-generated monthly, and revisable with full history preserved; duplicate generation is prevented
- Previous unpaid rent is always visible; sequential settlement is enforceable per the approved rule
- Online payments are server-side verified; offline payments are audited; duplicates are prevented
- The ledger is traceable and never silently altered
- Public users never see private tenant information; individual notices reach only their intended recipient
- All admin actions are auditable; authentication secrets are never logged
- Hindi and English are supported throughout

---

## 38. MVP Scope

| Area               | Included                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Public**         | Home, About, Rental/Properties, Notices, Documents, Feedback, Contact, Sign In, Hindi/English                             |
| **Authentication** | Admin/User login, OTP, first-time password setup, forgot password, admin MFA                                              |
| **Admin**          | Dashboard, user/property/rent management, property assignment, previous dues, payments, ledger, receipts, notices, complaints, reports, audit logs |
| **Super Admin**    | All admin functionality + Sub Admin creation and management                                                               |
| **User**           | Dashboard, profile, property, rent, dues, payments, ledger, receipts, notices, notifications, complaints                  |
| **Security**       | RBAC, HTTPS, password hashing, OTP, MFA, rate limiting, input validation, audit logging, secure uploads, secure payment verification |

---

## 39. Phase 2 / Future Enhancements

WhatsApp notifications · mobile application · advanced analytics and dashboards · advanced financial reporting · automated penalty/late-fee engine · additional payment gateways · WAF · advanced monitoring and automated security scanning · additional document workflows · multi-district support · additional department integrations.

*Not part of MVP unless explicitly approved.*

---

## 40. Acceptance Criteria

The project is functionally ready when, for each area, the following hold true:

- **Authentication** — no self-registration is possible; admin-created accounts work; OTP-based first login and password reset function; admin MFA is enforced; unauthorized access to protected modules is blocked
- **Roles** — Super Admin can create Sub Admins; Sub Admin cannot create admins; users cannot reach admin functions or other users' data
- **Properties** — admins can create/assign properties; no user holds multiple active properties; occupancy status and (where implemented) assignment history are maintained
- **Rent** — admin-assigned and auto-generated monthly without duplicates; revisions preserve history; previous unpaid rent is displayed
- **Payments** — online payments verified server-side via the approved gateway; offline entries recordable by authorized admins; duplicates prevented; ledger updates correctly
- **Ledger** — debit/credit and balance are correctly maintained, traceable, and viewable by authorized users
- **Receipts** — generated for every successful payment with a unique number, required transaction data, and protected access
- **Notices** — public notices display as configured; individual notices reach only their intended recipient; attachments follow security rules
- **Complaints** — users can submit, attach files, and track status; admins can update status
- **Reports** — all listed reports (monthly/yearly collection, user-wise, property-wise, outstanding, payment, ledger) function correctly
- **Audit** — important admin actions and login/security activity are logged, secrets are excluded, and access is restricted to authorized admins
- **Localization** — Hindi and English are available across major pages, forms, and messages
- **Security** — HTTPS in production, hashed passwords, backend-enforced RBAC, rate limiting, input validation, restricted uploads, server-side payment verification, and no secrets in source control

---

## 41. Documentation Deliverables

- `PRD.md`
- `SECURITY.md`
- `README.md`
- API Documentation
- Database Schema Documentation
- Deployment Documentation
- Environment Variables Documentation
- Backup & Recovery Documentation
- User/Admin Manual
- Test Plan / Test Cases

---

## 42. Final Product Vision

The system provides a centralized, secure, and transparent digital platform for Almora Zila Panchayat's rental and property operations, built so future functionality can be added without compromising existing financial records, security, auditability, or user data isolation.

```
Public Website → Authentication → Role-Based Access → Admin / User Portals
→ Property Management → Rent Management → Payments → Ledger → Receipts
→ Notices / Complaints → Reports → Audit & Security
```

---

**Document Status:** Version 1.0 · Draft Baseline · Prepared for the Almora Zila Panchayat Rental Management System

**Next Stage:** UI/UX Design → Database Design → API Design → Development → Testing → Security Testing → Deployment