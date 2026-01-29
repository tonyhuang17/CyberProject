import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5055'

type User = { id: string; email: string; role: string }
type Secret = {
  _id: string
  name: string
  description: string
  secretType: string
  secretValue: string
  environment: string
  service: string
  expiresAt: string
  lastRotated: string
  sharedWith: string[]
  status: string
  ownerEmail: string
  createdAt: string
  accessLog: { accessedBy: string; accessedAt: string; action: string }[]
}
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

function getToken(): string | null {
  // Intentionally insecure ("bad mode"): JWT stored in localStorage for students to identify and fix.
  return localStorage.getItem('token')
}

async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getToken()
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { ok:false, error: json?.error || `HTTP ${res.status}` }
    return { ok:true, data: json }
  } catch (e: any) {
    return { ok:false, error: e?.message || 'Network error' }
  }
}

const STATUS_COLORS: Record<string, string> = {
  'active': '#22c55e',
  'expired': '#f59e0b',
  'revoked': '#ef4444',
  'rotating': '#3b82f6'
}

const ENV_COLORS: Record<string, string> = {
  'development': '#22c55e',
  'staging': '#f59e0b',
  'production': '#ef4444'
}

const TYPE_ICONS: Record<string, string> = {
  'api-key': '🔑',
  'password': '🔒',
  'token': '🎫',
  'certificate': '📜',
  'ssh-key': '🖥️',
  'other': '📦'
}

function maskSecret(secret: string): string {
  if (secret.length <= 8) return '••••••••'
  return secret.slice(0, 4) + '••••••••' + secret.slice(-4)
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('dev1@example.com')
  const [password, setPassword] = useState('Password123!')
  const [status, setStatus] = useState<string>('')

  const [items, setItems] = useState<Secret[]>([])
  const [form, setForm] = useState<any>({ secretType: 'api-key', environment: 'development', status: 'active' })
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())

  const hasToken = useMemo(() => !!getToken(), [status])

  async function loadMe() {
    const r = await api<User>('/auth/me')
    if (r.ok) setUser(r.data as any)
  }

  async function loadItems() {
    const r = await api<Secret[]>('/api/items')
    if (r.ok) setItems(r.data as any)
    else setStatus(r.error)
  }

  useEffect(() => {
    if (hasToken) {
      loadMe().then(loadItems)
    }
  }, [hasToken])

  async function login() {
    setStatus('')
    const r = await api<any>('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
    if (!r.ok) return setStatus(r.error)
    localStorage.setItem('token', (r.data as any).token)
    await loadMe()
    await loadItems()
    setStatus('Logged in')
  }

  async function register() {
    setStatus('')
    const r = await api<any>('/auth/register', { method:'POST', body: JSON.stringify({ email, password }) })
    if (!r.ok) return setStatus(r.error)
    localStorage.setItem('token', (r.data as any).token)
    await loadMe()
    await loadItems()
    setStatus('Registered & logged in')
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    setItems([])
    setRevealedSecrets(new Set())
    setStatus('Logged out')
  }

  async function createItem() {
    setStatus('')
    const r = await api<any>('/api/items', { method:'POST', body: JSON.stringify(form) })
    if (!r.ok) return setStatus(r.error)
    setForm({ secretType: 'api-key', environment: 'development', status: 'active' })
    await loadItems()
    setStatus('Secret stored')
  }

  function toggleReveal(id: string) {
    setRevealedSecrets(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function revokeSecret(id: string) {
    if (!confirm('Are you sure you want to revoke this secret?')) return
    const r = await api<any>(`/api/items/${id}/revoke`, { method: 'POST' })
    if (!r.ok) return setStatus(r.error)
    await loadItems()
    setStatus('Secret revoked')
  }

  if (!hasToken) {
    return (
      <div className="container">
        <h1>KeyKeeper</h1>
        <p className="subtitle">Secure Secrets & API Key Vault</p>

        <div className="card">
          <h2>Sign In</h2>
          <div className="row">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
          </div>
          <div className="row" style={{marginTop:12}}>
            <button onClick={login}>Login</button>
            <button onClick={register} className="secondary">Register</button>
          </div>
          {status && <p className={status.includes('error') ? 'err' : 'ok'}>{status}</p>}
          <div className="hint-box">
            <p className="small"><strong>Test Accounts:</strong></p>
            <p className="small"><code>dev1@example.com</code> · <code>devops1@example.com</code> · <code>admin1@example.com</code></p>
            <p className="small">Password: <code>Password123!</code></p>
          </div>
        </div>
      </div>
    )
  }

  const activeSecrets = items.filter(i => i.status === 'active').length
  const productionSecrets = items.filter(i => i.environment === 'production').length
  const expiringSecrets = items.filter(i => {
    if (!i.expiresAt) return false
    const expiry = new Date(i.expiresAt)
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return expiry < thirtyDays && i.status === 'active'
  }).length

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{marginBottom:4}}>KeyKeeper</h1>
          <div className="small">Signed in as <b>{user?.email}</b> (role: <b>{user?.role}</b>)</div>
        </div>
        <button onClick={logout} className="secondary">Logout</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{activeSecrets}</div>
          <div className="stat-label">Active Secrets</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{productionSecrets}</div>
          <div className="stat-label">Production</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{expiringSecrets}</div>
          <div className="stat-label">Expiring Soon</div>
        </div>
      </div>

      <div className="card">
        <h2>Store New Secret</h2>
        <div className="form-grid">
          <input value={form.name || ''} onChange={e=>setForm((f:any)=>({...f, name:e.target.value}))} placeholder="Secret Name" />
          <input value={form.service || ''} onChange={e=>setForm((f:any)=>({...f, service:e.target.value}))} placeholder="Service (e.g., AWS, GitHub)" />
          <select value={form.secretType || 'api-key'} onChange={e=>setForm((f:any)=>({...f, secretType:e.target.value}))}>
            <option value="api-key">🔑 API Key</option>
            <option value="password">🔒 Password</option>
            <option value="token">🎫 Token</option>
            <option value="certificate">📜 Certificate</option>
            <option value="ssh-key">🖥️ SSH Key</option>
            <option value="other">📦 Other</option>
          </select>
          <select value={form.environment || 'development'} onChange={e=>setForm((f:any)=>({...f, environment:e.target.value}))}>
            <option value="development">🟢 Development</option>
            <option value="staging">🟡 Staging</option>
            <option value="production">🔴 Production</option>
          </select>
        </div>
        <input 
          value={form.secretValue || ''} 
          onChange={e=>setForm((f:any)=>({...f, secretValue:e.target.value}))} 
          placeholder="Secret Value"
          type="password"
          style={{width:'100%', marginTop:12}}
        />
        <input 
          value={form.description || ''} 
          onChange={e=>setForm((f:any)=>({...f, description:e.target.value}))} 
          placeholder="Description"
          style={{width:'100%', marginTop:12}}
        />
        <button onClick={createItem} style={{marginTop:16}}>Store Secret</button>
        {status && <p className={status.includes('error') ? 'err' : 'ok'}>{status}</p>}
      </div>

      <div className="card">
        <h2>Secrets Vault</h2>
        <div className="secret-list">
          {items.map((it) => (
            <div key={it._id} className={`secret-item ${it.environment === 'production' ? 'production-secret' : ''}`}>
              <div className="secret-header">
                <div className="secret-title-row">
                  <span className="type-icon">{TYPE_ICONS[it.secretType]}</span>
                  <div>
                    <strong>{it.name}</strong>
                    <div className="small" style={{opacity:0.6}}>{it.service} · {it.description}</div>
                  </div>
                </div>
                <div className="secret-badges">
                  <span className="env-badge" style={{background: ENV_COLORS[it.environment]}}>{it.environment}</span>
                  <span className="status-badge" style={{background: STATUS_COLORS[it.status]}}>{it.status}</span>
                </div>
              </div>
              
              <div className="secret-value-row">
                <code className="secret-value">
                  {revealedSecrets.has(it._id) ? it.secretValue : maskSecret(it.secretValue)}
                </code>
                <button className="small-btn" onClick={() => toggleReveal(it._id)}>
                  {revealedSecrets.has(it._id) ? '🙈 Hide' : '👁️ Reveal'}
                </button>
                <button className="small-btn copy-btn" onClick={() => navigator.clipboard.writeText(it.secretValue)}>
                  📋 Copy
                </button>
              </div>

              <div className="secret-meta">
                <span>Owner: {it.ownerEmail}</span>
                {it.expiresAt && <span>Expires: {new Date(it.expiresAt).toLocaleDateString()}</span>}
                {it.sharedWith?.length > 0 && <span>Shared with: {it.sharedWith.join(', ')}</span>}
              </div>

              {it.status === 'active' && (
                <div className="secret-actions">
                  <button className="small-btn danger" onClick={() => revokeSecret(it._id)}>Revoke</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
