import mongoose from 'mongoose'

export async function connectDb(mongoUrl) {
  const url = mongoUrl || 'mongodb://localhost:27017/fundflowdb'
  mongoose.set('strictQuery', true)
  await mongoose.connect(url)
  console.log('Connected to MongoDB:', url)
}
