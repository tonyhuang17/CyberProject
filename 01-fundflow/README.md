# 💰 FundFlow

A corporate expense reimbursement system where employees submit expense reports and managers approve them.

## 🎯 Domain
**Finance / HR** — Corporate expense tracking with approval workflows

## 🚀 Quick Start

### Ports
- API: http://localhost:5051
- Client: http://localhost:5171

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
| `employee1@example.com` | employee | Submit expenses |
| `manager1@example.com` | manager | Approve expenses |
| `admin1@example.com` | admin | Full access |

**Password:** `Password123!`

## 📊 Data Model

### Expense
- `name` — Expense title
- `description` — Details
- `amount` — Dollar amount
- `category` — travel, meals, supplies, equipment, other
- `receiptUrl` — Link to receipt image
- `status` — pending, approved, rejected, reimbursed
- `approvedBy` — Manager who approved
- `approvedAt` — Approval timestamp

## 🎓 Threat Modeling Exercise

See `threat-model/` folder for templates:
- `dfd.puml` — Data Flow Diagram
- `stride-table.md` — STRIDE threat analysis
- `dread-risk-register.csv` — DREAD risk scoring
- `pasta-template.md` — PASTA methodology
- `owasp-test-plan.md` — OWASP test cases

### Suggested Focus Areas
1. **Authorization flows** — Who should approve expenses?
2. **Data exposure** — Should employees see each other's expenses?
3. **Financial integrity** — Can amounts be tampered with?
4. **Audit trail** — Is approval history properly tracked?
