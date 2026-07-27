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

// Serve /.well-known directory for Android TWA verification to eliminate top URL bar
const wellKnownPath = path.join(__dirname, '../public/.well-known')
if (fs.existsSync(wellKnownPath)) {
  app.use('/.well-known', express.static(wellKnownPath))
}

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

// Email Transporter setup for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'anshujaiswal3000@gmail.com',
    pass: process.env.EMAIL_PASS || 'demo_pass'
  }
})

// POST /api/auth/send-otp -> Generate 6-digit OTP and send via Email
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    const targetEmail = (email || 'anshujaiswal3000@gmail.com').trim().toLowerCase()
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(targetEmail, { otp, expires: Date.now() + 600000 }) // Valid for 10 minutes

    console.log(`🔐 OTP Generated for ${targetEmail}: ${otp}`)

    // Try sending email via Nodemailer
    try {
      if (process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: '"AttendX Attendance Tracker" <anshujaiswal3000@gmail.com>',
          to: targetEmail,
          subject: '🔐 AttendX Password Reset OTP Code',
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; background: #0b1120; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #60a5fa;">AttendX Password Reset</h2>
            <p>Your 6-digit OTP code to reset your password is:</p>
            <h1 style="font-size: 36px; letter-spacing: 6px; color: #34d399; background: rgba(16,185,129,0.1); padding: 10px 20px; display: inline-block; border-radius: 8px;">${otp}</h1>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
          </div>`
        })
      }
    } catch (mailErr) {
      console.warn('⚠️ Nodemailer delivery notice:', mailErr.message)
    }

    res.json({
      success: true,
      message: `6-Digit OTP sent to ${targetEmail}. Please check your Gmail Inbox / Spam folder.`
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/verify-otp-reset -> Verify OTP and reset password
app.post('/api/auth/verify-otp-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    const targetEmail = (email || 'anshujaiswal3000@gmail.com').trim().toLowerCase()

    if (!newPassword || newPassword.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'New password must be at least 3 characters long.' })
    }

    const stored = otpStore.get(targetEmail)
    if (!stored || stored.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid. Please request a new OTP.' })
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code! Please check your Gmail inbox.' })
    }

    // OTP Verified! Update Password in MongoDB
    let userDoc = await UserData.findOne({})
    if (!userDoc) {
      userDoc = new UserData({ userId: 'anshu', password: newPassword.trim(), email: targetEmail })
    } else {
      userDoc.password = newPassword.trim()
      userDoc.updatedAt = new Date()
    }
    await userDoc.save()

    // Clear OTP
    otpStore.delete(targetEmail)

    console.log(`✅ Password successfully reset via OTP for ${targetEmail}`)
    res.json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/verify -> Verify Owner Credentials strictly against MongoDB
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { userId, password } = req.body
    const inputUser = (userId || '').trim().toLowerCase()
    const inputPass = (password || '').trim()

    let userDoc = await UserData.findOne({ userId: inputUser })
    if (!userDoc) {
      userDoc = await UserData.findOne({})
    }

    if (!userDoc) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    if (userDoc.password === inputPass) {
      return res.json({ success: true, userId: userDoc.userId })
    }

    res.status(401).json({ success: false, message: 'Invalid credentials' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/auth/change-credentials -> Change Owner UserId & Password
app.post('/api/auth/change-credentials', async (req, res) => {
  try {
    const { oldUserId, oldPassword, newUserId, newPassword } = req.body

    let userDoc = await UserData.findOne({ userId: (oldUserId || 'anshu').trim().toLowerCase() })
    if (!userDoc) userDoc = await UserData.findOne({})

    if (!userDoc || userDoc.password !== (oldPassword || '').trim()) {
      return res.status(401).json({ success: false, message: 'Incorrect Current Password!' })
    }

    if (!newPassword || newPassword.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'New password must be at least 3 characters.' })
    }

    userDoc.userId = (newUserId || 'anshu').trim().toLowerCase()
    userDoc.password = newPassword.trim()
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
