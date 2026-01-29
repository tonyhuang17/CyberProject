import mongoose from 'mongoose'

const SecretSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  secretType: { type: String, enum: ['api-key', 'password', 'token', 'certificate', 'ssh-key', 'other'], default: 'api-key' },
  secretValue: { type: String, required: true },  // Intentionally stored in plaintext for security exercise
  environment: { type: String, enum: ['development', 'staging', 'production'], default: 'development' },
  service: { type: String, default: '' },
  expiresAt: { type: Date },
  lastRotated: { type: Date },
  sharedWith: [{ type: String }],  // Array of email addresses
  accessLog: [{
    accessedBy: String,
    accessedAt: { type: Date, default: Date.now },
    action: String
  }],
  status: { type: String, enum: ['active', 'expired', 'revoked', 'rotating'], default: 'active' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ownerEmail: { type: String, default: '' }
}, { timestamps: true })

export const Item = mongoose.model('Secret', SecretSchema)
