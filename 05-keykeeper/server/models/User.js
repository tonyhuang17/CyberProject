import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, default: 'student' }
}, { timestamps: true })

export const User = mongoose.model('User', UserSchema)
