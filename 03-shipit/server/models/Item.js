import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  category: { type: String, enum: ['electronics', 'clothing', 'home', 'sports', 'books', 'other'], default: 'other' },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'draft', 'out-of-stock', 'discontinued'], default: 'draft' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ownerEmail: { type: String, default: '' }
}, { timestamps: true })

export const Item = mongoose.model('Product', ProductSchema)
