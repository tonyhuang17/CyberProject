import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models/User.js'
import { signToken } from '../lib/jwt.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

router.post('/register', async (req, res) => {
  const parsed = credsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const { email, password } = parsed.data
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, role: 'student' })
  const token = signToken({ sub: String(user._id), role: user.role })
  res.json({ token })
})

router.post('/login', async (req, res) => {
  const parsed = credsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })
  const { email, password } = parsed.data

  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ sub: String(user._id), role: user.role })
  res.json({ token })
})

router.get('/me', requireAuth, async (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role })
})

export default router
