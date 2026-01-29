import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDb } from './lib/db.js'
import authRoutes from './routes/auth.js'
import apiRoutes from './routes/api.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/api', apiRoutes)

const port = process.env.PORT || 5055
await connectDb(process.env.MONGO_URL)

app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
