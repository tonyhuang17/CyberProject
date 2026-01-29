import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5053'

type User = { id: string; email: string; role: string }
type Product = {
  _id: string
  name: string
  description: string
  price: number
  originalPrice: number
  category: string
  stock: number
  sku: string
  featured: boolean
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
  'active': '#22c55e',
  'draft': '#6b7280',
  'out-of-stock': '#f59e0b',
  'discontinued': '#ef4444'
}

const CATEGORY_ICONS: Record<string, string> = {
  'electronics': '📱',
  'clothing': '👕',
  'home': '🏠',
  'sports': '⚽',
  'books': '📚',
  'other': '📦'
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('customer1@example.com')
  const [password, setPassword] = useState('Password123!')
  const [status, setStatus] = useState<string>('')

  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState<any>({ price: 0, stock: 0, category: 'other', status: 'draft' })

  const hasToken = useMemo(() => !!getToken(), [status])

  async function loadMe() {
    const r = await api<User>('/auth/me')
    if (r.ok) setUser(r.data as any)
  }

  async function loadItems() {
    const r = await api<Product[]>('/api/items')
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
    const payload = { ...form, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 }
    const r = await api<any>('/api/items', { method:'POST', body: JSON.stringify(payload) })
    if (!r.ok) return setStatus(r.error)
    setForm({ price: 0, stock: 0, category: 'other', status: 'draft' })
    await loadItems()
    setStatus('Product created')
  }

  async function purchaseProduct(id: string, price: number) {
    const r = await api<any>(`/api/items/${id}/purchase`, { 
      method: 'POST',
      body: JSON.stringify({ quantity: 1, clientPrice: price })
    })
    if (!r.ok) return setStatus(r.error)
    setStatus(`Purchase successful! Total: $${(r.data as any).total}`)
  }

  if (!hasToken) {
    return (
      <div className="container">
        <h1>ShipIt</h1>
        <p className="subtitle">E-Commerce Platform & Product Management</p>

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
            <p className="small"><code>customer1@example.com</code> · <code>seller1@example.com</code> · <code>admin1@example.com</code></p>
            <p className="small">Password: <code>Password123!</code></p>
          </div>
        </div>
      </div>
    )
  }

  const activeProducts = items.filter(i => i.status === 'active').length
  const totalInventory = items.reduce((sum, i) => sum + i.stock, 0)
  const featuredCount = items.filter(i => i.featured).length

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{marginBottom:4}}>ShipIt</h1>
          <div className="small">Signed in as <b>{user?.email}</b> (role: <b>{user?.role}</b>)</div>
        </div>
        <button onClick={logout} className="secondary">Logout</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{activeProducts}</div>
          <div className="stat-label">Active Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalInventory}</div>
          <div className="stat-label">Total Inventory</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{featuredCount}</div>
          <div className="stat-label">Featured Items</div>
        </div>
      </div>

      <div className="card">
        <h2>Add New Product</h2>
        <div className="form-grid">
          <input value={form.name || ''} onChange={e=>setForm((f:any)=>({...f, name:e.target.value}))} placeholder="Product Name" />
          <input value={form.description || ''} onChange={e=>setForm((f:any)=>({...f, description:e.target.value}))} placeholder="Description" />
          <input type="number" value={form.price || ''} onChange={e=>setForm((f:any)=>({...f, price:e.target.value}))} placeholder="Price" step="0.01" min="0" />
          <input type="number" value={form.stock || ''} onChange={e=>setForm((f:any)=>({...f, stock:e.target.value}))} placeholder="Stock Quantity" min="0" />
          <input value={form.sku || ''} onChange={e=>setForm((f:any)=>({...f, sku:e.target.value}))} placeholder="SKU" />
          <select value={form.category || 'other'} onChange={e=>setForm((f:any)=>({...f, category:e.target.value}))}>
            <option value="electronics">📱 Electronics</option>
            <option value="clothing">👕 Clothing</option>
            <option value="home">🏠 Home</option>
            <option value="sports">⚽ Sports</option>
            <option value="books">📚 Books</option>
            <option value="other">📦 Other</option>
          </select>
          <select value={form.status || 'draft'} onChange={e=>setForm((f:any)=>({...f, status:e.target.value}))}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>
        <button onClick={createItem} style={{marginTop:16}}>Add Product</button>
        {status && <p className={status.includes('error') ? 'err' : 'ok'}>{status}</p>}
      </div>

      <div className="card">
        <h2>Product Catalog</h2>
        <div className="product-grid">
          {items.map((it) => (
            <div key={it._id} className={`product-card ${it.status === 'draft' ? 'draft-product' : ''}`}>
              {it.featured && <span className="featured-badge">⭐ Featured</span>}
              <div className="product-category">{CATEGORY_ICONS[it.category]} {it.category}</div>
              <h3>{it.name}</h3>
              <p className="small">{it.description}</p>
              <div className="product-price">
                <span className="price">${it.price.toFixed(2)}</span>
                {it.originalPrice > it.price && (
                  <span className="original-price">${it.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="product-meta">
                <span>Stock: {it.stock}</span>
                <span className="status-badge" style={{background: STATUS_COLORS[it.status]}}>{it.status}</span>
              </div>
              <div className="small" style={{marginTop:8, opacity:0.5}}>SKU: {it.sku}</div>
              {it.status === 'active' && it.stock > 0 && (
                <button className="small-btn" style={{marginTop:12, width:'100%'}} onClick={() => purchaseProduct(it._id, it.price)}>
                  Buy Now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
