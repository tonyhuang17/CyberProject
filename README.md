# MERN Security Capstone Pack

Five independent MERN applications designed for practicing security threat modeling methodologies including **STRIDE**, **DREAD**, **PASTA**, and **OWASP Testing Guide**.

Each application represents a different domain with unique security challenges and intentional vulnerabilities for educational purposes.

---

## 🎯 Applications Overview

### 01-FundFlow — Corporate Expense Reimbursement
**Domain:** Finance / HR  
**Port:** API 5051 | Client 5171  
**Theme:** Green/Emerald

A corporate expense tracking system where employees submit reimbursement requests and managers approve them.

**Key Features:**
- Expense submission with categories (travel, meals, supplies, equipment)
- Manager approval workflow
- Receipt URL attachments
- Role-based access (student/employee, manager, admin)

---

### 02-ClinicQueue — Healthcare Appointment System
**Domain:** Healthcare  
**Port:** API 5052 | Client 5172  
**Theme:** Teal/Medical

A patient appointment booking system for a medical clinic with check-in functionality.

**Key Features:**
- Patient appointment scheduling
- Department and doctor assignment
- Check-in workflow with timestamps
- Appointment status tracking

---

### 03-ShipIt — E-Commerce Platform
**Domain:** Retail / E-Commerce  
**Port:** API 5053 | Client 5173  
**Theme:** Orange/Commerce

A product catalog and purchasing platform with inventory management.

**Key Features:**
- Product catalog with categories
- Shopping/purchase functionality
- Inventory tracking (stock levels)
- Featured products and discounts

---

### 04-IncidentHub — IT Service Desk
**Domain:** IT Operations / Help Desk  
**Port:** API 5054 | Client 5174  
**Theme:** Purple/Tech

An IT ticketing system for managing support requests and incidents.

**Key Features:**
- Ticket creation with priority/severity levels
- Technician assignment
- Internal notes (should be private)
- Resolution tracking

---

### 05-KeyKeeper — Secrets Vault
**Domain:** DevOps / Security  
**Port:** API 5055 | Client 5175  
**Theme:** Gold/Amber

A secrets management system for storing API keys, passwords, and tokens.

**Key Features:**
- Secret storage with types (API keys, passwords, tokens, certificates)
- Environment tagging (dev, staging, production)
- Secret reveal/mask functionality
- Revocation capability

---

## 🚀 Quick Start (Windows / PowerShell)

### Prerequisites
- Node.js 18+ (or use the install script)
- MongoDB running locally (or use the install script)

### Install Node.js (if needed)
```powershell
.\install-node-windows.ps1
```

### Install MongoDB (if needed)
```powershell
.\install-mongodb-windows.ps1
```

### Run Any Application
```powershell
cd 01-fundflow   # or any app folder
.\scripts\install.ps1
.\scripts\seed.ps1
npm run dev
```
---

## 📚 Threat Modeling Exercise

Each application includes a `threat-model/` folder with templates:

- **dfd.puml** — Data Flow Diagram (PlantUML)
- **stride-table.md** — STRIDE analysis template
- **dread-risk-register.csv** — DREAD risk scoring
- **pasta-template.md** — PASTA methodology template
- **owasp-test-plan.md** — OWASP testing checklist

### Recommended Workflow

1. **Choose an application** based on domain interest
2. **Review the codebase** to understand data flows
3. **Complete the DFD** (Data Flow Diagram)
4. **Apply STRIDE** to identify threats per component
5. **Score risks with DREAD** to prioritize findings
6. **Document with PASTA** for business context
7. **Create OWASP test cases** to validate findings

---

## 📁 Project Structure

```
security-capstone/
├── README.md                    # This file
├── install-node-windows.ps1     # Node.js installer
├── install-mongodb-windows.ps1  # MongoDB installer
├── 01-fundflow/                 # Expense reimbursement app
├── 02-clinicqueue/              # Healthcare appointments
├── 03-shipit/                   # E-commerce platform
├── 04-incidenthub/              # IT ticketing system
└── 05-keykeeper/                # Secrets vault
```

---

## 🔐 Test Accounts

All applications use the same password: `Password123!`

| App | Accounts |
|-----|----------|
| FundFlow | `employee1@example.com`, `manager1@example.com`, `admin1@example.com` |
| ClinicQueue | `patient1@example.com`, `nurse1@example.com`, `doctor1@example.com` |
| ShipIt | `customer1@example.com`, `seller1@example.com`, `admin1@example.com` |
| IncidentHub | `user1@example.com`, `tech1@example.com`, `admin1@example.com` |
| KeyKeeper | `dev1@example.com`, `devops1@example.com`, `admin1@example.com` |

---

# MERN Security Capstone Pack

Five independent MERN applications designed for practicing security threat modeling methodologies including **STRIDE**, **DREAD**, **PASTA**, and **OWASP Testing Guide**.

Each application represents a different domain with unique security challenges and intentional vulnerabilities for educational purposes.

---

## 🎯 Applications Overview

### 01-FundFlow — Corporate Expense Reimbursement
**Domain:** Finance / HR  
**Port:** API 5051 | Client 5171  
**Theme:** Green/Emerald

A corporate expense tracking system where employees submit reimbursement requests and managers approve them.

**Key Features:**
- Expense submission with categories (travel, meals, supplies, equipment)
- Manager approval workflow
- Receipt URL attachments
- Role-based access (student/employee, manager, admin)

---

### 02-ClinicQueue — Healthcare Appointment System
**Domain:** Healthcare  
**Port:** API 5052 | Client 5172  
**Theme:** Teal/Medical

A patient appointment booking system for a medical clinic with check-in functionality.

**Key Features:**
- Patient appointment scheduling
- Department and doctor assignment
- Check-in workflow with timestamps
- Appointment status tracking

---

### 03-ShipIt — E-Commerce Platform
**Domain:** Retail / E-Commerce  
**Port:** API 5053 | Client 5173  
**Theme:** Orange/Commerce

A product catalog and purchasing platform with inventory management.

**Key Features:**
- Product catalog with categories
- Shopping/purchase functionality
- Inventory tracking (stock levels)
- Featured products and discounts

---

### 04-IncidentHub — IT Service Desk
**Domain:** IT Operations / Help Desk  
**Port:** API 5054 | Client 5174  
**Theme:** Purple/Tech

An IT ticketing system for managing support requests and incidents.

**Key Features:**
- Ticket creation with priority/severity levels
- Technician assignment
- Internal notes (should be private)
- Resolution tracking

---

### 05-KeyKeeper — Secrets Vault
**Domain:** DevOps / Security  
**Port:** API 5055 | Client 5175  
**Theme:** Gold/Amber

A secrets management system for storing API keys, passwords, and tokens.

**Key Features:**
- Secret storage with types (API keys, passwords, tokens, certificates)
- Environment tagging (dev, staging, production)
- Secret reveal/mask functionality
- Revocation capability

---

## 🚀 Quick Start (Windows / PowerShell)

### Prerequisites
- Node.js 18+ (or use the install script)
- MongoDB running locally (or use the install script)

### Install Node.js (if needed)
```powershell
.\install-node-windows.ps1
```

### Install MongoDB (if needed)
```powershell
.\install-mongodb-windows.ps1
```

### Run Any Application
```powershell
cd 01-fundflow   # or any app folder
.\scripts\install.ps1
.\scripts\seed.ps1
npm run dev
```
---

## 📚 Threat Modeling Exercise

Each application includes a `threat-model/` folder with templates:

- **dfd.puml** — Data Flow Diagram (PlantUML)
- **stride-table.md** — STRIDE analysis template
- **dread-risk-register.csv** — DREAD risk scoring
- **pasta-template.md** — PASTA methodology template
- **owasp-test-plan.md** — OWASP testing checklist

### Recommended Workflow

1. **Choose an application** based on domain interest
2. **Review the codebase** to understand data flows
3. **Complete the DFD** (Data Flow Diagram)
4. **Apply STRIDE** to identify threats per component
5. **Score risks with DREAD** to prioritize findings
6. **Document with PASTA** for business context
7. **Create OWASP test cases** to validate findings

---

## 📁 Project Structure

```
security-capstone/
├── README.md                    # This file
├── install-node-windows.ps1     # Node.js installer
├── install-mongodb-windows.ps1  # MongoDB installer
├── 01-fundflow/                 # Expense reimbursement app
├── 02-clinicqueue/              # Healthcare appointments
├── 03-shipit/                   # E-commerce platform
├── 04-incidenthub/              # IT ticketing system
└── 05-keykeeper/                # Secrets vault
```

---

## 🔐 Test Accounts

All applications use the same password: `Password123!`

| App | Accounts |
|-----|----------|
| FundFlow | `employee1@example.com`, `manager1@example.com`, `admin1@example.com` |
| ClinicQueue | `patient1@example.com`, `nurse1@example.com`, `doctor1@example.com` |
| ShipIt | `customer1@example.com`, `seller1@example.com`, `admin1@example.com` |
| IncidentHub | `user1@example.com`, `tech1@example.com`, `admin1@example.com` |
| KeyKeeper | `dev1@example.com`, `devops1@example.com`, `admin1@example.com` |

---
