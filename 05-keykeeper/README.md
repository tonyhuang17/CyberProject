# 🔐 KeyKeeper

A secrets management vault for storing API keys, passwords, tokens, and credentials.

## 🎯 Domain
**DevOps / Security** — Credentials and secrets management

## 🚀 Quick Start

### Ports
- API: http://localhost:5055
- Client: http://localhost:5175

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
| `dev1@example.com` | developer | View secrets |
| `devops1@example.com` | devops | Manage secrets |
| `admin1@example.com` | admin | Full access |

**Password:** `Password123!`

## 📊 Data Model

### Secret
- `name` — Secret identifier
- `description` — What the secret is for
- `secretType` — api-key, password, token, certificate, ssh-key
- `secretValue` — The actual secret (⚠️ stored in plaintext!)
- `environment` — development, staging, production
- `service` — Associated service (AWS, GitHub, etc.)
- `expiresAt` — Expiration date
- `sharedWith` — Users who have access
- `accessLog` — Access history
- `status` — active, expired, revoked

## 🎓 Threat Modeling Exercise

See `threat-model/` folder for templates:
- `dfd.puml` — Data Flow Diagram
- `stride-table.md` — STRIDE threat analysis
- `dread-risk-register.csv` — DREAD risk scoring
- `pasta-template.md` — PASTA methodology
- `owasp-test-plan.md` — OWASP test cases

### Suggested Focus Areas
1. **Encryption** — How should secrets be stored?
2. **Access Control** — Who should access which secrets?
3. **Key Management** — How are encryption keys managed?
4. **Audit Logging** — Is secret access properly logged?
5. **Secret Rotation** — Is the rotation process secure?

### Real-World Comparison
Compare this application to industry solutions:
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- 1Password Secrets Automation

What security controls do they implement that KeyKeeper is missing?
