import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Item } from '../models/Item.js'

const router = Router()

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  amount: z.number().min(0),
  currency: z.string().optional().default('USD'),
  category: z.enum(['travel', 'meals', 'supplies', 'equipment', 'software', 'other']).optional().default('other'),
  receiptUrl: z.string().optional().default(''),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'reimbursed']).optional().default('draft')
})

router.get('/items', requireAuth, async (req, res) => {
  // Intentionally insecure: returns all expenses (Broken Access Control practice)
  // Students should identify that users can see other users' expense reports
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

// Intentionally insecure: no ownership check (IDOR vulnerability)
router.put('/items/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const updates = req.body
  const item = await Item.findByIdAndUpdate(id, updates, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// Approve expense (should be manager/admin only - but no role check = vulnerability)
router.post('/items/:id/approve', requireAuth, async (req, res) => {
  const { id } = req.params
  const item = await Item.findByIdAndUpdate(id, {
    status: 'approved',
    approvedBy: req.user.id,
    approvedAt: new Date()
  }, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

export default router
