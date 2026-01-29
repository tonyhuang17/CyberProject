import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5052'

type User = { id: string; email: string; role: string }
type Appointment = {
  _id: string
  patientName: string
  patientDOB: string
  patientPhone: string
  appointmentDate: string
  appointmentTime: string
  department: string
  doctor: string
  reason: string
  notes: string
  status: string
  ownerEmail: string
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
  'scheduled': '#3b82f6',
  'checked-in': '#f59e0b',
  'in-progress': '#8b5cf6',
  'completed': '#22c55e',
  'cancelled': '#6b7280',
  'no-show': '#ef4444'
}

const DEPT_ICONS: Record<string, string> = {
  'general': '🏥',
  'cardiology': '❤️',
  'dermatology': '🔬',
  'neurology': '🧠',
  'pediatrics': '👶',
  'orthopedics': '🦴'
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('patient1@example.com')
  const [password, setPassword] = useState('Password123!')
  const [status, setStatus] = useState<string>('')

  const [items, setItems] = useState<Appointment[]>([])
  const [form, setForm] = useState<any>({ department: 'general', status: 'scheduled' })

  const hasToken = useMemo(() => !!getToken(), [status])

  async function loadMe() {
    const r = await api<User>('/auth/me')
    if (r.ok) setUser(r.data as any)
  }

  async function loadItems() {
    const r = await api<Appointment[]>('/api/items')
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
    setForm({ department: 'general', status: 'scheduled' })
    await loadItems()
    setStatus('Appointment scheduled')
  }

  async function checkIn(id: string) {
    const r = await api<any>(`/api/items/${id}/checkin`, { method: 'POST' })
    if (!r.ok) return setStatus(r.error)
    await loadItems()
    setStatus('Patient checked in')
  }

  if (!hasToken) {
    return (
      <div className="container">
        <h1>ClinicQueue</h1>
        <p className="subtitle">Patient Appointment & Scheduling Portal</p>

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
            <p className="small"><code>patient1@example.com</code> · <code>nurse1@example.com</code> · <code>doctor1@example.com</code></p>
            <p className="small">Password: <code>Password123!</code></p>
          </div>
        </div>
      </div>
    )
  }

  const todayAppts = items.filter(i => {
    const date = new Date(i.appointmentDate)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  })
  const scheduledCount = items.filter(i => i.status === 'scheduled').length
  const checkedInCount = items.filter(i => i.status === 'checked-in').length

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{marginBottom:4}}>ClinicQueue</h1>
          <div className="small">Signed in as <b>{user?.email}</b> (role: <b>{user?.role}</b>)</div>
        </div>
        <button onClick={logout} className="secondary">Logout</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{todayAppts.length}</div>
          <div className="stat-label">Today's Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{scheduledCount}</div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{checkedInCount}</div>
          <div className="stat-label">Waiting Room</div>
        </div>
      </div>

      <div className="card">
        <h2>Schedule Appointment</h2>
        <div className="form-grid">
          <input value={form.patientName || ''} onChange={e=>setForm((f:any)=>({...f, patientName:e.target.value}))} placeholder="Patient Name" />
          <input value={form.patientDOB || ''} onChange={e=>setForm((f:any)=>({...f, patientDOB:e.target.value}))} placeholder="Date of Birth (YYYY-MM-DD)" />
          <input value={form.patientPhone || ''} onChange={e=>setForm((f:any)=>({...f, patientPhone:e.target.value}))} placeholder="Phone Number" />
          <input type="date" value={form.appointmentDate || ''} onChange={e=>setForm((f:any)=>({...f, appointmentDate:e.target.value}))} />
          <input type="time" value={form.appointmentTime || ''} onChange={e=>setForm((f:any)=>({...f, appointmentTime:e.target.value}))} />
          <select value={form.department || 'general'} onChange={e=>setForm((f:any)=>({...f, department:e.target.value}))}>
            <option value="general">🏥 General</option>
            <option value="cardiology">❤️ Cardiology</option>
            <option value="dermatology">🔬 Dermatology</option>
            <option value="neurology">🧠 Neurology</option>
            <option value="pediatrics">👶 Pediatrics</option>
            <option value="orthopedics">🦴 Orthopedics</option>
          </select>
          <input value={form.doctor || ''} onChange={e=>setForm((f:any)=>({...f, doctor:e.target.value}))} placeholder="Doctor Name" />
          <input value={form.reason || ''} onChange={e=>setForm((f:any)=>({...f, reason:e.target.value}))} placeholder="Reason for Visit" />
        </div>
        <button onClick={createItem} style={{marginTop:16}}>Schedule Appointment</button>
        {status && <p className={status.includes('error') ? 'err' : 'ok'}>{status}</p>}
      </div>

      <div className="card">
        <h2>All Appointments</h2>
        <table>
          <thead>
            <tr>
              <th>Patient</th><th>Date/Time</th><th>Department</th><th>Doctor</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id}>
                <td>
                  <div><strong>{it.patientName}</strong></div>
                  <div className="small" style={{opacity:0.6}}>DOB: {it.patientDOB} · {it.patientPhone}</div>
                </td>
                <td>
                  <div>{new Date(it.appointmentDate).toLocaleDateString()}</div>
                  <div className="small">{it.appointmentTime}</div>
                </td>
                <td><span className="badge">{DEPT_ICONS[it.department]} {it.department}</span></td>
                <td className="small">{it.doctor}</td>
                <td><span className="status-badge" style={{background: STATUS_COLORS[it.status]}}>{it.status}</span></td>
                <td>
                  {it.status === 'scheduled' && (
                    <button className="small-btn" onClick={() => checkIn(it._id)}>Check In</button>
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
