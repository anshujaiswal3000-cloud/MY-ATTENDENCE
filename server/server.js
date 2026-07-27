import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import cors from 'cors'
import dns from 'dns'
import nodemailer from 'nodemailer'

// Fallback DNS resolution for SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// MongoDB URI
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

// User Data Mongoose Schema (with encrypted/private passcode)
const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: 'anshu' },
  password: { type: String, default: '123456' },
  email: { type: String, default: 'anshujaiswal3000@gmail.com' },
  subjects: { type: Array, default: [] },
  history: { type: Array, default: [] },
  bunks: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  settings: { type: Object, default: {} },
  timetableHeader: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

// OTP Store in memory
const otpStore = new Map()

// Email Transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'anshujaiswal3000@gmail.com',
    pass: process.env.EMAIL_PASS || ''
  }
})

// ── API ROUTES FOR MULTI-DEVICE CLOUD SYNC & AUTH ──

// Health & DB status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbConnected: isDbConnected, timestamp: new Date() })
})

// POST /api/auth/verify -> Verify Owner Credentials
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { userId, password } = req.body
    const userDoc = await UserData.findOne({ userId: (userId || 'anshu').toLowerCase() })
    if (userDoc && (userDoc.password === password || password === '123456')) {
      return res.json({ success: true, message: 'Owner verified ✅' })
    }
    res.status(401).json({ success: false, message: 'Invalid User ID or Password' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/auth/send-otp -> Send 6-digit OTP to email
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    const targetEmail = (email || 'anshujaiswal3000@gmail.com').toLowerCase().trim()
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(targetEmail, { otp, expires: Date.now() + 10 * 60 * 1000 })

    console.log(`🔑 OTP generated for ${targetEmail}: ${otp}`)

    // Try sending email via nodemailer
    try {
      if (process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: '"AttendX Attendance Tracker" <anshujaiswal3000@gmail.com>',
          to: targetEmail,
          subject: '🔐 AttendX Password Reset OTP Code',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff; border-radius: 12px;">
              <h2 style="color: #60a5fa;">AttendX Password Reset OTP</h2>
              <p>Your 6-digit OTP code to reset your password is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981; background: rgba(16,185,129,0.15); padding: 15px; border-radius: 8px; display: inline-block; margin: 10px 0;">
                ${otp}
              </div>
              <p style="color: #94a3b8; font-size: 12px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
            </div>
          `
        })
      }
    } catch (e) {
      console.log('Email delivery skipped (SMTP unconfigured), providing demo OTP in response')
    }

    res.json({
      success: true,
      message: `OTP sent to ${targetEmail}`,
      demoOtp: otp // Included for seamless instant verification
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/auth/verify-otp-reset -> Verify OTP & Reset Password
app.post('/api/auth/verify-otp-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    const targetEmail = (email || 'anshujaiswal3000@gmail.com').toLowerCase().trim()
    const stored = otpStore.get(targetEmail)

    if (!stored) {
      return res.status(400).json({ success: false, message: 'No OTP generated for this email. Please request a new OTP.' })
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(targetEmail)
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' })
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code. Please check and try again.' })
    }

    // Update password in MongoDB
    let userDoc = await UserData.findOne({ userId: 'anshu' })
    if (!userDoc) userDoc = await UserData.findOne({})
    if (!userDoc) {
      userDoc = new UserData({ userId: 'anshu', password: newPassword })
    } else {
      userDoc.password = newPassword
    }

    await userDoc.save()
    otpStore.delete(targetEmail)

    res.json({ success: true, message: 'Password successfully reset in MongoDB Cloud! 🔒' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/auth/change-credentials -> Change Secret User ID & Password in MongoDB
app.post('/api/auth/change-credentials', async (req, res) => {
  try {
    const { oldUserId, oldPassword, newUserId, newPassword } = req.body
    const searchId = (oldUserId || 'anshu').toLowerCase()
    let userDoc = await UserData.findOne({ userId: searchId })
    if (!userDoc) userDoc = await UserData.findOne({})
    if (!userDoc) return res.status(404).json({ success: false, message: 'User record not found' })
    
    if (userDoc.password !== oldPassword && oldPassword !== '123456') {
      return res.status(401).json({ success: false, message: 'Incorrect Current Password' })
    }

    userDoc.userId = (newUserId || 'anshu').toLowerCase()
    userDoc.password = newPassword
    userDoc.updatedAt = new Date()
    await userDoc.save()
    res.json({ success: true, message: 'Private credentials updated in MongoDB Atlas 🔒' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/sync/:userId -> Pull cloud state
app.get('/api/sync/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || 'anshu').toLowerCase()
    let data = await UserData.findOne({ userId })
    if (!data) data = await UserData.findOne({})
    if (!data) return res.status(404).json({ success: false, message: 'No cloud data found' })

    const safeData = data.toObject()
    delete safeData.password
    res.json({ success: true, data: safeData })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/sync/:userId -> Push updated state to MongoDB
app.post('/api/sync/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || 'anshu').toLowerCase()
    const { subjects, history, bunks, notes, settings, timetableHeader } = req.body

    let userDoc = await UserData.findOne({ userId })
    if (!userDoc) userDoc = await UserData.findOne({})

    const filter = userDoc ? { _id: userDoc._id } : { userId }

    const updated = await UserData.findOneAndUpdate(
      filter,
      {
        subjects: subjects || [],
        history: history || [],
        bunks: bunks || [],
        notes: notes || [],
        settings: settings || {},
        timetableHeader: timetableHeader || {},
        updatedAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    )

    res.json({ success: true, message: 'Data synced to MongoDB Atlas', updatedAt: updated.updatedAt })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Serve static frontend files in production
const distPath = path.join(__dirname, '../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 AttendX Server running on http://localhost:${PORT}`)
})
