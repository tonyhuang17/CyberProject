import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Item } from '../models/Item.js'

const router = Router()

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  secretType: z.enum(['api-key', 'password', 'token', 'certificate', 'ssh-key', 'other']).optional().default('api-key'),
  secretValue: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production']).optional().default('development'),
  service: z.string().optional().default(''),
  expiresAt: z.string().optional().transform(s => s ? new Date(s) : undefined),
  sharedWith: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'expired', 'revoked', 'rotating']).optional().default('active')
})

router.get('/items', requireAuth, async (req, res) => {
  // CRITICAL VULNERABILITY: Returns ALL secrets including values (Broken Access Control + Sensitive Data Exposure)
  // Students should identify that users can see ALL secrets, including production credentials!
  const items = await Item.find({}).sort({ createdAt: -1 }).lean()
  res.json(items)
})

router.post('/items', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const it = await Item.create({
    ...parsed.data,
    ownerId: req.user.id,
    ownerEmail: req.user.email,
    accessLog: [{ accessedBy: req.user.email, action: 'created' }]
  })
  res.json(it)
})

// Intentionally insecure: no ownership check - anyone can view secret value (IDOR)
router.get('/items/:id/reveal', requireAuth, async (req, res) => {
  const { id } = req.params
  const item = await Item.findById(id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  
  // Log access but don't verify ownership!
  item.accessLog.push({ accessedBy: req.user.email, action: 'revealed' })
  await item.save()
  
  res.json({ secretValue: item.secretValue })
})

// Rotate secret - should verify ownership but doesn't
router.post('/items/:id/rotate', requireAuth, async (req, res) => {
  const { id } = req.params
  const { newSecretValue } = req.body
  
  const item = await Item.findByIdAndUpdate(id, {
    secretValue: newSecretValue,
    lastRotated: new Date(),
    $push: { accessLog: { accessedBy: req.user.email, action: 'rotated' } }
  }, { new: true })
  
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// Revoke secret - anyone can revoke any secret!
router.post('/items/:id/revoke', requireAuth, async (req, res) => {
  const { id } = req.params
  const item = await Item.findByIdAndUpdate(id, {
    status: 'revoked',
    $push: { accessLog: { accessedBy: req.user.email, action: 'revoked' } }
  }, { new: true })
  
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

export default router
