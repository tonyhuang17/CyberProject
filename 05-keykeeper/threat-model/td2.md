# KeyKeeper Secrets Management Vault - Threat Model Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer - Browser"
        A[User Browser]
        B[React Frontend]
        C[LocalStorage<br/>JWT Token Storage]
    end
    
    subgraph "Network Layer"
        D[HTTP/HTTPS<br/>localhost:5055]
    end
    
    subgraph "Application Layer - Express API"
        E[Auth Routes<br/>/auth/*]
        F[API Routes<br/>/api/items*]
        G[JWT Middleware<br/>requireAuth]
        H[Password Hashing<br/>bcryptjs]
    end
    
    subgraph "Data Layer"
        I[(MongoDB Database)]
        J[User Collection<br/>email, passwordHash, role]
        K[Secrets Collection<br/>secretValue in PLAINTEXT]
    end
    
    A -->|User Actions| B
    B -->|Store JWT| C
    B -->|API Requests + Bearer Token| D
    D --> E
    D --> F
    E -->|Validate Credentials| H
    E -->|Create/Verify JWT| G
    F -->|Verify JWT| G
    E -->|Read/Write Users| J
    F -->|Read/Write Secrets| K
    J -.->|Stored in| I
    K -.->|Stored in| I
    
    style C fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style K fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style D fill:#ffd43b,stroke:#fab005,stroke-width:2px
    
Data Flow Diagram
Authentication Flow
graph TB
    A[User Input<br/>email + password]
    B[React Frontend]
    C[POST /auth/login<br/>email, password]
    D[Auth Route Handler]
    E[MongoDB Query<br/>Find user by email]
    F[(User Collection<br/>passwordHash)]
    G[bcrypt.compare<br/>password, hash]
    H[signToken<br/>sub: userId, role]
    I[JWT Token<br/>Generated]
    J[Response<br/>token]
    K[LocalStorage<br/>Store JWT]
    
    A -->|User submits| B
    B -->|HTTP POST| C
    C --> D
    D -->|Query| E
    E --> F
    F -->|User record| D
    D --> G
    G -->|Valid| H
    H --> I
    I --> J
    J -->|Store token| K
    K -->|Token cached| B
    
    style A fill:#e3f2fd
    style K fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style I fill:#ffd43b
    style F fill:#d0bfff
    
    L[❌ VULNERABILITIES]
    L -.->|No HTTPS| C
    L -.->|XSS vulnerable| K
    L -.->|No expiration| I
Secret Storage Flow
graph TB
    A[User Creates Secret<br/>name, value, type, env]
    B[React Frontend<br/>Form state]
    C[Retrieve JWT<br/>from localStorage]
    D[POST /api/items<br/>+ Bearer token]
    E[API Route Handler]
    F[JWT Verification<br/>requireAuth middleware]
    G{Token Valid?}
    H[Extract User Info<br/>user.id, user.role]
    I[Create Secret Document<br/>+ ownerEmail<br/>⚠️ secretValue PLAINTEXT]
    J[(MongoDB<br/>Secrets Collection)]
    K[Response<br/>Success]
    L[Update UI<br/>Display new secret]
    
    A --> B
    B --> C
    C -->|JWT retrieved| D
    D --> E
    E --> F
    F --> G
    G -->|Yes| H
    G -->|No| M[401 Unauthorized]
    H --> I
    I -->|Insert document| J
    J -->|Stored in DB| K
    K --> L
    
    style C fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style I fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style J fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style M fill:#ffd43b
    
    N[❌ CRITICAL ISSUES]
    N -.->|No encryption| I
    N -.->|Plaintext storage| J
    N -.->|XSS risk| C
Secret Retrieval Flow
graph TB
    A[Page Load<br/>useEffect]
    B[Retrieve JWT<br/>from localStorage]
    C[GET /api/items<br/>+ Bearer token]
    D[API Route Handler]
    E[JWT Verification<br/>requireAuth middleware]
    F{Token Valid?}
    G[MongoDB Query<br/>Find ALL secrets]
    H[(Secrets Collection<br/>Returns EVERYTHING)]
    I[Response<br/>Array of secrets<br/>⚠️ ALL secretValues in PLAINTEXT]
    J[React State<br/>setItems array]
    K[Render Secrets<br/>masked by default]
    L[User clicks 'Reveal']
    M[Toggle revealedSecrets Set]
    N[Display PLAINTEXT<br/>secretValue]
    O[User clicks 'Copy']
    P[navigator.clipboard<br/>Copy plaintext secret]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F -->|Yes| G
    F -->|No| Q[401 Unauthorized]
    G --> H
    H -->|All secrets returned| I
    I -->|Over HTTP| J
    J --> K
    K --> L
    L --> M
    M --> N
    K --> O
    O --> P
    
    style B fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style H fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style I fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style N fill:#ffd43b
    style P fill:#ffd43b
    style Q fill:#ffd43b
    
    R[❌ CRITICAL ISSUES]
    R -.->|No filtering/RBAC| G
    R -.->|Returns ALL secrets| H
    R -.->|HTTP transmission| I
    R -.->|Client-side masking only| K
    R -.->|Clipboard exposure| P
Trust Boundaries
graph LR
    subgraph "UNTRUSTED ZONE"
        A[User's Browser]
        B[User's Device]
        C[Network Traffic]
    end
    
    subgraph "TRUST BOUNDARY 1"
        D[Express API Server]
    end
    
    subgraph "TRUST BOUNDARY 2"
        E[(MongoDB Database)]
    end
    
    A -.->|HTTP - Unencrypted| D
    D -->|Database Connection| E
    
    style A fill:#ff6b6b,stroke:#c92a2a
    style B fill:#ff6b6b,stroke:#c92a2a
    style C fill:#ff6b6b,stroke:#c92a2a
Asset Inventory
mindmap
  root((KeyKeeper Assets))
    Critical Assets
      Production Secrets
        API Keys
        Passwords
        SSH Keys
        Certificates
      JWT Tokens
      User Credentials
    High Value Assets
      Staging Secrets
      Access Logs
      User Accounts
    Medium Value Assets
      Development Secrets
      Secret Metadata
Attack Surface Map
graph TB
    subgraph "External Attack Surface"
        A1[Web Application Port]
        A2[MongoDB Port]
        A3[Browser Storage]
        A4[Network Traffic]
    end
    
    subgraph "Application Attack Surface"
        B1[Authentication Endpoints]
        B2[API Endpoints]
        B3[JWT Token Handling]
        B4[Input Validation]
    end
    
    subgraph "Data Attack Surface"
        C1[Database Queries]
        C2[Plaintext Storage]
        C3[Access Control Logic]
    end
    
    A1 --> B1
    A1 --> B2
    A3 --> B3
    A4 --> B1
    A4 --> B2
    B1 --> C1
    B2 --> C1
    B2 --> C2
    B3 --> C3
    
    style A3 fill:#ff6b6b
    style C2 fill:#ff6b6b
    style A4 fill:#ffd43b
Security Controls (Current State)
graph LR
    subgraph "Authentication Controls"
        A1[Password Hashing<br/>bcryptjs salt=10]
        A2[JWT Tokens<br/>Bearer Auth]
        A3[Email Validation<br/>Zod schema]
    end
    
    subgraph "Missing/Weak Controls"
        B1[❌ No HTTPS/TLS]
        B2[❌ JWT in localStorage]
        B3[❌ Plaintext Secrets]
        B4[❌ No Rate Limiting]
        B5[❌ No MFA]
        B6[❌ No Encryption at Rest]
        B7[❌ Weak RBAC]
        B8[❌ No Session Management]
    end
    
    style B1 fill:#ff6b6b
    style B2 fill:#ff6b6b
    style B3 fill:#ff6b6b
    style B4 fill:#ffd43b
    style B5 fill:#ffd43b
    style B6 fill:#ff6b6b
    style B7 fill:#ffd43b
    style B8 fill:#ffd43b