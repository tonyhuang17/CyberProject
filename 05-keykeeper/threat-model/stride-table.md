# STRIDE Table
 
Legend: S=Spoofing, T=Tampering, R=Repudiation, I=Info Disclosure, D=DoS, E=Elevation
 
| DFD Element | Type | S | T | R | I | D | E | Threat(s) | Mitigation(s) | Evidence/Test |
|---|---|---|---|---|---|---|---|---|---|---|
| Browser → API<br/>`POST /auth/login` | Data Flow | ✓ | ✓ | ✓ | ✓ | ✓ |  | **S**: HTTP traffic can be hijacked. Attacker on network can capture JWT from response and impersonate user.<br/><br/>**T**: No TLS means attacker can modify login request/response in transit.<br/><br/>**R**: No logging of authentication attempts. User can deny login activity or attacker can attempt passwords without detection.<br/><br/>**I**: Password sent in plaintext over HTTP. Any network sniffer can read credentials.<br/><br/>**D**: No rate limiting on login endpoint. Attacker can flood with requests to exhaust server resources. | **S/T/I**: Implement HTTPS/TLS. Reject all HTTP requests.<br/><br/>**D**: Implement rate limiting (e.g., 5 attempts per 15 min per IP). | Capture HTTP traffic during login and verify credentials are visible in plaintext. Send 1000 login requests and check if server slows down or blocks. |
| Browser → API<br/>`GET /api/items`<br/>`POST /api/items` | Data Flow | ✓ | ✓ | ✓ | ✓ | ✓ |  | **S**: JWT Bearer token sent over HTTP. Network attacker captures token and replays it to impersonate user.<br/><br/>**T**: Attacker can intercept and modify secret data in transit.<br/><br/>**R**: No audit trail of which secrets were accessed or when. Users can access secrets and deny it later.<br/><br/>**I**: All secrets transmitted in plaintext JSON. Production API keys and passwords exposed over network.<br/><br/>**D**: No pagination or rate limiting. Attacker can request all secrets repeatedly to exhaust bandwidth and server resources. | **S/T/I**: Implement HTTPS/TLS. Consider end-to-end encryption for secretValue field.<br/><br/>**R**: Log every secret access (view, create, modify) with user ID, timestamp, IP address.<br/><br/>**D**: Implement pagination for GET requests. Add rate limiting per user. | Capture HTTP traffic for GET /api/items and verify all secretValue fields are readable. Call GET /api/items 1000 times rapidly and check for rate limiting. |
| API → MongoDB<br/>(queries) | Data Flow | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **S**: MongoDB connection without authentication. Anyone on network can connect directly to database.<br/><br/>**T**: MongoDB wire protocol unencrypted. Attacker can see and modify queries including plaintext secrets.<br/><br/>**R**: No database audit logging. Attacker can modify data and no record exists of the change.<br/><br/>**I**: Database credentials in environment variables. If leaked, attacker has full database access.<br/><br/>**D**: No connection pooling limits. Attacker can exhaust database connections.<br/><br/>**E**: Direct database access bypasses API authorization. Attacker could modify user roles or grant themselves access to any secret. | **S**: Enable MongoDB authentication.<br/><br/>**T**: Use TLS for MongoDB connection.<br/><br/>**R**: Enable MongoDB audit logging for all operations.<br/><br/>**I**: Store connection string in secrets manager.<br/><br/>**D**: Configure connection pool limits.<br/><br/>**E**: Minimize database user privileges. Use separate read-only and read-write users. | Attempt to connect to MongoDB without credentials. Try to open 1000 simultaneous connections. Connect directly and modify user role field. |
| MongoDB → API<br/>(results) | Data Flow |  | ✓ |  | ✓ |  |  | **T**: Unencrypted connection allows intercepting and modifying query results.<br/><br/>**I**: All secrets flow from database to API in plaintext. | **T**: Use TLS for MongoDB connection.<br/><br/>**I**: Encrypt secrets at rest in MongoDB. | Capture MongoDB wire protocol traffic and verify secretValue fields are readable. |
| API → Browser<br/>(responses) | Data Flow |  | ✓ | ✓ | ✓ |  |  | **T**: HTTP allows response tampering. Attacker could inject malicious secrets.<br/><br/>**R**: No logging of what data was sent to users. Cannot prove what information was disclosed.<br/><br/>**I**: Browser caches responses. Secrets may persist in browser cache or history. | **T**: Implement HTTPS.<br/><br/>**R**: Log all API responses including which secrets were returned to which user.<br/><br/>**I**: Set Cache-Control: no-store headers. Never put secrets in URL parameters. | Check browser DevTools Network tab and cache to verify if secrets are stored. |
| Browser → localStorage<br/>(JWT storage) | Data Flow | ✓ | ✓ |  | ✓ |  |  | **S**: XSS attack can steal JWT from localStorage. Attacker impersonates user indefinitely (no expiration).<br/><br/>**T**: Malicious browser extension can modify localStorage.<br/><br/>**I**: JWT visible in DevTools. JWT payload is base64-encoded (not encrypted). | **S**: Use httpOnly cookies instead. Implement CSP headers. Add JWT expiration.<br/><br/>**T**: Use httpOnly + Secure + SameSite cookie flags.<br/><br/>**I**: Minimize JWT payload data. | Create XSS payload in secret name field to steal JWT. Open DevTools and read localStorage token.
 
---
 
 
## Key Findings
 
🔴 **CRITICAL**: Every single data flow has cryptographic failures due to:
- No HTTPS/TLS anywhere
- Plaintext secret storage and transmission
- JWT in localStorage (XSS vulnerable)
- No MongoDB connection encryption
 
🔴 **CRITICAL**: The most dangerous flows are:
1. **Flow 3** (Browser → API for secrets) - Secrets transmitted in plaintext over HTTP
2. **Flow 7** (JWT in localStorage) - Permanent account takeover via XSS
3. **Flow 2** (Login over HTTP) - Credentials intercepted on network

