import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051'

type User = { id: string; email: string; role: string }
type Expense = {
  _id: string
  title: string
  description: string
  amount: number
  currency: string
  category: string
  status: string
  ownerEmail: string
  ownerId: string
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

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  submitted: '#3b82f6',
  approved: '#22c55e',
  rejected: '#ef4444',
  reimbursed: '#a855f7'
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('student1@example.com')
  const [password, setPassword] = useState('Password123!')
  const [status, setStatus] = useState<string>('')

  const [items, setItems] = useState<Expense[]>([])
  const [form, setForm] = useState<any>({ amount: 0, category: 'other', status: 'draft' })

  const hasToken = useMemo(() => !!getToken(), [status])

  async function loadMe() {
    const r = await api<User>('/auth/me')
    if (r.ok) setUser(r.data as any)
  }

  async function loadItems() {
    const r = await api<Expense[]>('/api/items')
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
    localStorage.setItem('token', (r.data as any).token) // bad mode
    await loadMe()
    await loadItems()
    setStatus('Logged in')
  }

  async function register() {
    setStatus('')
    const r = await api<any>('/auth/register', { method:'POST', body: JSON.stringify({ email, password }) })
    if (!r.ok) return setStatus(r.error)
    localStorage.setItem('token', (r.data as any).token) // bad mode
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
    const payload = { ...form, amount: parseFloat(form.amount) || 0 }
    const r = await api<any>('/api/items', { method:'POST', body: JSON.stringify(payload) })
    if (!r.ok) return setStatus(r.error)
    setForm({ amount: 0, category: 'other', status: 'draft' })
    await loadItems()
    setStatus('Expense created')
  }

  async function approveExpense(id: string) {
    const r = await api<any>(`/api/items/${id}/approve`, { method: 'POST' })
    if (!r.ok) return setStatus(r.error)
    await loadItems()
    setStatus('Expense approved')
  }

  if (!hasToken) {
    return (
      <div className="container">
        <h1>FundFlow</h1>
        <p className="subtitle">Expense Reimbursement & Approval Workflow</p>

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
            <p className="small"><code>student1@example.com</code> · <code>manager1@example.com</code> · <code>admin1@example.com</code></p>
            <p className="small">Password: <code>Password123!</code></p>
          </div>
        </div>
      </div>
    )
  }

  const totalPending = items.filter(i => i.status === 'submitted').reduce((sum, i) => sum + i.amount, 0)
  const totalApproved = items.filter(i => i.status === 'approved' || i.status === 'reimbursed').reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{marginBottom:4}}>FundFlow</h1>
          <div className="small">Signed in as <b>{user?.email}</b> (role: <b>{user?.role}</b>)</div>
        </div>
        <button onClick={logout} className="secondary">Logout</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">${totalPending.toFixed(2)}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${totalApproved.toFixed(2)}</div>
          <div className="stat-label">Approved/Reimbursed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
      </div>

      <div className="card">
        <h2>Submit New Expense</h2>
        <div className="form-grid">
          <input value={form.title || ''} onChange={e=>setForm((f:any)=>({...f, title:e.target.value}))} placeholder="Expense Title" />
          <input value={form.description || ''} onChange={e=>setForm((f:any)=>({...f, description:e.target.value}))} placeholder="Description" />
          <input type="number" value={form.amount || ''} onChange={e=>setForm((f:any)=>({...f, amount:e.target.value}))} placeholder="Amount" step="0.01" min="0" />
          <select value={form.category || 'other'} onChange={e=>setForm((f:any)=>({...f, category:e.target.value}))}>
            <option value="travel">✈️ Travel</option>
            <option value="meals">🍽️ Meals</option>
            <option value="supplies">📦 Supplies</option>
            <option value="equipment">💻 Equipment</option>
            <option value="software">🔧 Software</option>
            <option value="other">📋 Other</option>
          </select>
          <select value={form.status || 'draft'} onChange={e=>setForm((f:any)=>({...f, status:e.target.value}))}>
            <option value="draft">Draft</option>
            <option value="submitted">Submit for Approval</option>
          </select>
        </div>
        <button onClick={createItem} style={{marginTop:16}}>Create Expense</button>
        {status && <p className={status.includes('error') ? 'err' : 'ok'}>{status}</p>}
      </div>

      <div className="card">
        <h2>All Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Amount</th><th>Status</th><th>Submitted By</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id}>
                <td>
                  <div>{it.title}</div>
                  <div className="small" style={{opacity:0.6}}>{it.description}</div>
                </td>
                <td><span className="badge">{it.category}</span></td>
                <td><strong>${it.amount.toFixed(2)}</strong></td>
                <td><span className="status-badge" style={{background: STATUS_COLORS[it.status]}}>{it.status}</span></td>
                <td className="small">{it.ownerEmail}</td>
                <td>
                  {it.status === 'submitted' && (
                    <button className="small-btn" onClick={() => approveExpense(it._id)}>Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
