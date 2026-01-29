import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5054'

type User = { id: string; email: string; role: string }
type Ticket = {
  _id: string
  title: string
  description: string
  priority: string
  severity: string
  category: string
  assignedTo: string
  affectedSystem: string
  internalNotes: string
  resolution: string
  status: string
  ownerEmail: string
  createdAt: string
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

const PRIORITY_COLORS: Record<string, string> = {
  'low': '#22c55e',
  'medium': '#f59e0b',
  'high': '#f97316',
  'critical': '#ef4444'
}

const STATUS_COLORS: Record<string, string> = {
  'open': '#3b82f6',
  'in-progress': '#f59e0b',
  'pending': '#6b7280',
  'resolved': '#22c55e',
  'closed': '#374151'
}

const CATEGORY_ICONS: Record<string, string> = {
  'hardware': '🖥️',
  'software': '💾',
  'network': '🌐',
  'security': '🔒',
  'access': '🔑',
  'other': '📋'
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('user1@example.com')
  const [password, setPassword] = useState('Password123!')
  const [status, setStatus] = useState<string>('')

  const [items, setItems] = useState<Ticket[]>([])
  const [form, setForm] = useState<any>({ priority: 'medium', severity: 'moderate', category: 'other', status: 'open' })
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  const hasToken = useMemo(() => !!getToken(), [status])

  async function loadMe() {
    const r = await api<User>('/auth/me')
    if (r.ok) setUser(r.data as any)
  }

  async function loadItems() {
    const r = await api<Ticket[]>('/api/items')
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
    setStatus('Logged out')
  }

  async function createItem() {
    setStatus('')
    const r = await api<any>('/api/items', { method:'POST', body: JSON.stringify(form) })
    if (!r.ok) return setStatus(r.error)
    setForm({ priority: 'medium', severity: 'moderate', category: 'other', status: 'open' })
    await loadItems()
    setStatus('Ticket created')
  }

  async function resolveTicket(id: string) {
    const resolution = prompt('Enter resolution notes:')
    if (!resolution) return
    const r = await api<any>(`/api/items/${id}/resolve`, { 
      method: 'POST',
      body: JSON.stringify({ resolution })
    })
    if (!r.ok) return setStatus(r.error)
    await loadItems()
    setStatus('Ticket resolved')
  }

  if (!hasToken) {
    return (
      <div className="container">
        <h1>IncidentHub</h1>
        <p className="subtitle">IT Service Desk & Incident Management</p>

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
            <p className="small"><code>user1@example.com</code> · <code>tech1@example.com</code> · <code>admin1@example.com</code></p>
            <p className="small">Password: <code>Password123!</code></p>
          </div>
        </div>
      </div>
    )
  }

  const openTickets = items.filter(i => i.status === 'open').length
  const criticalTickets = items.filter(i => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length
  const inProgressTickets = items.filter(i => i.status === 'in-progress').length

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{marginBottom:4}}>IncidentHub</h1>
          <div className="small">Signed in as <b>{user?.email}</b> (role: <b>{user?.role}</b>)</div>
        </div>
        <button onClick={logout} className="secondary">Logout</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{openTickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-value">{criticalTickets}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inProgressTickets}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div className="card">
        <h2>Submit New Ticket</h2>
        <div className="form-grid">
          <input value={form.title || ''} onChange={e=>setForm((f:any)=>({...f, title:e.target.value}))} placeholder="Ticket Title" />
          <input value={form.affectedSystem || ''} onChange={e=>setForm((f:any)=>({...f, affectedSystem:e.target.value}))} placeholder="Affected System" />
          <select value={form.category || 'other'} onChange={e=>setForm((f:any)=>({...f, category:e.target.value}))}>
            <option value="hardware">🖥️ Hardware</option>
            <option value="software">💾 Software</option>
            <option value="network">🌐 Network</option>
            <option value="security">🔒 Security</option>
            <option value="access">🔑 Access Request</option>
            <option value="other">📋 Other</option>
          </select>
          <select value={form.priority || 'medium'} onChange={e=>setForm((f:any)=>({...f, priority:e.target.value}))}>
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🟠 High Priority</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>
        <textarea 
          value={form.description || ''} 
          onChange={e=>setForm((f:any)=>({...f, description:e.target.value}))} 
          placeholder="Describe the issue in detail..."
          style={{width:'100%', marginTop:12, minHeight:80}}
        />
        <button onClick={createItem} style={{marginTop:16}}>Submit Ticket</button>
        {status && <p className={status.includes('error') ? 'err' : 'ok'}>{status}</p>}
      </div>

      <div className="card">
        <h2>All Tickets</h2>
        <div className="ticket-list">
          {items.map((it) => (
            <div key={it._id} className={`ticket-item ${it.priority === 'critical' ? 'critical-ticket' : ''}`}>
              <div className="ticket-header" onClick={() => setExpandedTicket(expandedTicket === it._id ? null : it._id)}>
                <div className="ticket-title-row">
                  <span className="priority-indicator" style={{background: PRIORITY_COLORS[it.priority]}}></span>
                  <span className="category-icon">{CATEGORY_ICONS[it.category]}</span>
                  <strong>{it.title}</strong>
                </div>
                <div className="ticket-meta">
                  <span className="status-badge" style={{background: STATUS_COLORS[it.status]}}>{it.status}</span>
                  <span className="ticket-id">#{it._id.slice(-6)}</span>
                </div>
              </div>
              {expandedTicket === it._id && (
                <div className="ticket-details">
                  <p>{it.description}</p>
                  <div className="detail-grid">
                    <div><strong>Priority:</strong> <span style={{color: PRIORITY_COLORS[it.priority]}}>{it.priority.toUpperCase()}</span></div>
                    <div><strong>Severity:</strong> {it.severity}</div>
                    <div><strong>Category:</strong> {it.category}</div>
                    <div><strong>Affected System:</strong> {it.affectedSystem || 'N/A'}</div>
                    <div><strong>Assigned To:</strong> {it.assignedTo || 'Unassigned'}</div>
                    <div><strong>Reporter:</strong> {it.ownerEmail}</div>
                  </div>
                  {it.internalNotes && (
                    <div className="internal-notes">
                      <strong>🔒 Internal Notes:</strong>
                      <p>{it.internalNotes}</p>
                    </div>
                  )}
                  {it.resolution && (
                    <div className="resolution-notes">
                      <strong>✅ Resolution:</strong>
                      <p>{it.resolution}</p>
                    </div>
                  )}
                  {it.status !== 'resolved' && it.status !== 'closed' && (
                    <button className="small-btn" onClick={() => resolveTicket(it._id)}>Mark Resolved</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
