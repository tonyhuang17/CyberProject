# 🛒 ShipIt

An e-commerce platform with product catalog, purchasing, and inventory management.

## 🎯 Domain
**Retail / E-Commerce** — Product catalog and purchasing system

## 🚀 Quick Start

### Ports
- API: http://localhost:5053
- Client: http://localhost:5173

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
| `customer1@example.com` | customer | Browse and purchase |
| `seller1@example.com` | seller | Manage products |
| `admin1@example.com` | admin | Full access |

**Password:** `Password123!`

## 📊 Data Model

### Product
- `name` — Product title
- `description` — Product details
- `price` — Current selling price
- `originalPrice` — Original price (for discounts)
- `category` — electronics, clothing, home, sports, etc.
- `stock` — Inventory quantity
- `sku` — Stock keeping unit
- `featured` — Featured product flag
- `status` — active, out-of-stock, discontinued

## 🎓 Threat Modeling Exercise

See `threat-model/` folder for templates:
- `dfd.puml` — Data Flow Diagram
- `stride-table.md` — STRIDE threat analysis
- `dread-risk-register.csv` — DREAD risk scoring
- `pasta-template.md` — PASTA methodology
- `owasp-test-plan.md` — OWASP test cases

### Suggested Focus Areas
1. **Payment Integrity** — Is the price validated server-side?
2. **Inventory Management** — Can stock be manipulated?
3. **Business Logic** — What edge cases exist in the purchase flow?
4. **Data Validation** — Are inputs properly sanitized?
