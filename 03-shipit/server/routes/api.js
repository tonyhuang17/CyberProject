import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Item } from '../models/Item.js'

const router = Router()

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().min(0),
  originalPrice: z.number().optional().default(0),
  category: z.enum(['electronics', 'clothing', 'home', 'sports', 'books', 'other']).optional().default('other'),
  stock: z.number().min(0).optional().default(0),
  sku: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'draft', 'out-of-stock', 'discontinued']).optional().default('draft')
})

router.get('/items', requireAuth, async (req, res) => {
  // Intentionally insecure: returns all products including drafts (Information Disclosure)
  // Students should identify that users can see unpublished products and internal pricing
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
  // No validation - allows price manipulation!
  const updates = req.body
  const item = await Item.findByIdAndUpdate(id, updates, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// "Purchase" endpoint - insecure: trusts client-side price
router.post('/items/:id/purchase', requireAuth, async (req, res) => {
  const { id } = req.params
  const { quantity, clientPrice } = req.body  // Trusting client price = vulnerability!
  const item = await Item.findById(id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  
  // Bad: using clientPrice instead of server-side price
  const total = (clientPrice || item.price) * (quantity || 1)
  
  res.json({ 
    message: 'Purchase successful (simulated)',
    product: item.name,
    quantity: quantity || 1,
    total: total
  })
})

export default router
