import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// MongoDB URI (defaults to user's MongoDB cluster)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Connect to MongoDB
let isDbConnected = false
mongoose.connect(MONGODB_URI)
  .then(() => {
    isDbConnected = true
    console.log('✅ Connected to MongoDB Atlas Cloud Database!')
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message)
  })

// User Data Mongoose Schema
const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: 'anshu' },
  subjects: { type: Array, default: [] },
  history: { type: Array, default: [] },
  bunks: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  settings: { type: Object, default: {} },
  timetableHeader: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const UserData = mongoose.model('UserData', userDataSchema)

// ── API ROUTES FOR MULTI-DEVICE CLOUD SYNC ──

// Health & DB status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbConnected: isDbConnected, timestamp: new Date() })
})

// GET /api/sync/:userId -> Pull cloud state
app.get('/api/sync/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || 'anshu').toLowerCase()
    let data = await UserData.findOne({ userId })
    if (!data) {
      return res.status(404).json({ success: false, message: 'No cloud data found for user' })
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/sync/:userId -> Push updated state to MongoDB
app.post('/api/sync/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || 'anshu').toLowerCase()
    const { subjects, history, bunks, notes, settings, timetableHeader } = req.body

    const updated = await UserData.findOneAndUpdate(
      { userId },
      {
        subjects: subjects || [],
        history: history || [],
        bunks: bunks || [],
        notes: notes || [],
        settings: settings || {},
        timetableHeader: timetableHeader || {},
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )

    res.json({ success: true, data: updated, message: 'Synced to MongoDB Cloud Database ✅' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── SERVE STATIC FRONTEND DIST ──
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

// SPA Fallback
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(200).send('<!DOCTYPE html><html><head><title>AttendX</title></head><body style="background:#070b13;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;"><div><h2>AttendX App Initializing...</h2><p>Please refresh the page in 5 seconds.</p></div></body></html>')
  }
})

app.listen(PORT, () => {
  console.log(`🚀 AttendX Cloud Server running on port ${PORT}`)
})
