import mongoose from 'mongoose'

const AppointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientDOB: { type: String, default: '' },
  patientPhone: { type: String, default: '' },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  department: { type: String, enum: ['general', 'cardiology', 'dermatology', 'neurology', 'pediatrics', 'orthopedics'], default: 'general' },
  doctor: { type: String, default: '' },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ownerEmail: { type: String, default: '' }
}, { timestamps: true })

export const Item = mongoose.model('Appointment', AppointmentSchema)
