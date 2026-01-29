import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Item } from '../models/Item.js'

const router = Router()

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']).optional().default('moderate'),
  category: z.enum(['hardware', 'software', 'network', 'security', 'access', 'other']).optional().default('other'),
  affectedSystem: z.string().optional().default(''),
  status: z.enum(['open', 'in-progress', 'pending', 'resolved', 'closed']).optional().default('open')
})

router.get('/items', requireAuth, async (req, res) => {
  // Intentionally insecure: returns all tickets including internal notes (Information Disclosure)
  // Students should identify that users can see internal IT notes and other users' tickets
  const items = await Item.find({}).sort({ createdAt: -1 }).lean()
  res.json(items)
})

router.post('/items', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const it = await Item.create({
    ...parsed.data,
    ownerId: req.user.id,
    ownerEmail: req.user.email
  })
  res.json(it)
})

// Intentionally insecure: no ownership or role check (IDOR + privilege escalation)
router.put('/items/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const updates = req.body
  const item = await Item.findByIdAndUpdate(id, updates, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// Assign ticket - should be tech/admin only but no check = vulnerability
router.post('/items/:id/assign', requireAuth, async (req, res) => {
  const { id } = req.params
  const { assignedTo } = req.body
  const item = await Item.findByIdAndUpdate(id, {
    assignedTo,
    status: 'in-progress'
  }, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// Resolve ticket - anyone can resolve any ticket = vulnerability
router.post('/items/:id/resolve', requireAuth, async (req, res) => {
  const { id } = req.params
  const { resolution } = req.body
  const item = await Item.findByIdAndUpdate(id, {
    resolution,
    status: 'resolved'
  }, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

export default router
