# 🎫 IncidentHub

An IT service desk ticketing system for managing support requests and incidents.

## 🎯 Domain
**IT Operations / Help Desk** — Incident tracking and resolution

## 🚀 Quick Start

### Ports
- API: http://localhost:5054
- Client: http://localhost:5174

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
| `user1@example.com` | user | Create tickets |
| `tech1@example.com` | technician | Resolve tickets |
| `admin1@example.com` | admin | Full access |

**Password:** `Password123!`

## 📊 Data Model

### Ticket
- `name` — Ticket title/summary
- `description` — Issue details
- `priority` — low, medium, high, critical
- `severity` — minor, moderate, major, critical
- `category` — hardware, software, network, access, other
- `assignedTo` — Assigned technician
- `internalNotes` — Private technician notes (should be hidden!)
- `resolution` — Resolution details
- `status` — open, in-progress, resolved, closed

## 🎓 Threat Modeling Exercise

See `threat-model/` folder for templates:
- `dfd.puml` — Data Flow Diagram
- `stride-table.md` — STRIDE threat analysis
- `dread-risk-register.csv` — DREAD risk scoring
- `pasta-template.md` — PASTA methodology
- `owasp-test-plan.md` — OWASP test cases

### Suggested Focus Areas
1. **Information Disclosure** — What data shouldn't users see?
2. **Access Control** — Who should resolve tickets?
3. **Data Integrity** — Can ticket details be tampered?
4. **Audit Trail** — Is resolution history tracked?
