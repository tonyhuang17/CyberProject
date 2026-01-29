import mongoose from 'mongoose'

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  severity: { type: String, enum: ['minor', 'moderate', 'major', 'critical'], default: 'moderate' },
  category: { type: String, enum: ['hardware', 'software', 'network', 'security', 'access', 'other'], default: 'other' },
  assignedTo: { type: String, default: '' },
  affectedSystem: { type: String, default: '' },
  internalNotes: { type: String, default: '' },
  resolution: { type: String, default: '' },
  status: { type: String, enum: ['open', 'in-progress', 'pending', 'resolved', 'closed'], default: 'open' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ownerEmail: { type: String, default: '' }
}, { timestamps: true })

export const Item = mongoose.model('Ticket', TicketSchema)
