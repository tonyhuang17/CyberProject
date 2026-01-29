# 🏥 ClinicQueue

A healthcare appointment booking system for patients to schedule visits and staff to manage check-ins.

## 🎯 Domain
**Healthcare** — Patient scheduling and check-in workflow

## 🚀 Quick Start

### Ports
- API: http://localhost:5052
- Client: http://localhost:5172

### Run (PowerShell)
```powershell
# Install all dependencies (root, server, client)
.\scripts\install.ps1

# Seed database and start development servers
npm run seed
npm run dev
```

## 👤 Test Accounts
| Email | Role | Access Level |
|-------|------|-------------|
| `patient1@example.com` | patient | Book appointments |
| `nurse1@example.com` | nurse | Check-in patients |
| `doctor1@example.com` | doctor | Full access |

**Password:** `Password123!`

## 📊 Data Model

### Appointment
- `name` — Appointment title/reason
- `patientName` — Patient full name
- `patientDOB` — Date of birth (PHI)
- `appointmentDate` — Scheduled date/time
- `department` — general, cardiology, orthopedics, pediatrics, etc.
- `doctor` — Assigned physician
- `status` — scheduled, checked-in, in-progress, completed, cancelled
- `notes` — Clinical notes

## 🎓 Threat Modeling Exercise

See `threat-model/` folder for templates:
- `dfd.puml` — Data Flow Diagram
- `stride-table.md` — STRIDE threat analysis
- `dread-risk-register.csv` — DREAD risk scoring
- `pasta-template.md` — PASTA methodology
- `owasp-test-plan.md` — OWASP test cases

### Suggested Focus Areas
1. **PHI Protection** — Is patient health information properly secured?
2. **HIPAA Compliance** — What controls are missing?
3. **Access Control** — Should patients see other appointments?
4. **Data Integrity** — Can appointment dates be manipulated?
