import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  category: { type: String, enum: ['travel', 'meals', 'supplies', 'equipment', 'software', 'other'], default: 'other' },
  receiptUrl: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'reimbursed'], default: 'draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ownerEmail: { type: String, default: '' }
}, { timestamps: true })

export const Item = mongoose.model('Expense', ExpenseSchema)
