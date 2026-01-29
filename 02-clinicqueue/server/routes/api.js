import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Item } from '../models/Item.js'

const router = Router()

const createSchema = z.object({
  patientName: z.string().min(1),
  patientDOB: z.string().optional().default(''),
  patientPhone: z.string().optional().default(''),
  appointmentDate: z.string().transform(s => new Date(s)),
  appointmentTime: z.string().min(1),
  department: z.enum(['general', 'cardiology', 'dermatology', 'neurology', 'pediatrics', 'orthopedics']).optional().default('general'),
  doctor: z.string().optional().default(''),
  reason: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  status: z.enum(['scheduled', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show']).optional().default('scheduled')
})

router.get('/items', requireAuth, async (req, res) => {
  // Intentionally insecure: returns all appointments (HIPAA violation / Broken Access Control)
  // Students should identify that users can see other patients' medical appointments
  const items = await Item.find({}).sort({ appointmentDate: 1 }).lean()
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

// Check-in patient (should verify ownership - but no check = vulnerability)
router.post('/items/:id/checkin', requireAuth, async (req, res) => {
  const { id } = req.params
  const item = await Item.findByIdAndUpdate(id, {
    status: 'checked-in'
  }, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

export default router
