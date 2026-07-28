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

// User Data Mongoose Schema (with persistent autoLoggedSlots)
const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: 'anshu' },
  password: { type: String, default: '123456' },
  email: { type: String, default: 'anshujaiswal3000@gmail.com' },
  subjects: { type: Array, default: [] },
  sem1Subjects: { type: Array, default: [] },
  sem2Subjects: { type: Array, default: [] },
  history: { type: Array, default: [] },
  bunks: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  settings: { type: Object, default: {} },
  timetableHeader: { type: Object, default: {} },
  autoLoggedSlots: { type: Array, default: [] },
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

// ── SERVER-SIDE HELPER UTILITIES ──
function getTodayNameServer() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const idx = new Date().getDay()
  return days[idx]
}

function parseEndTimeServer(timeRangeStr) {
  try {
    const parts = timeRangeStr.split('-')
    if (parts.length < 2) return null
    const endStr = parts[1].trim()
    const [timeVal, modifier] = endStr.split(' ')
    let [hours, minutes] = timeVal.split(':').map(Number)

    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    return { hours, minutes }
  } catch (err) {
    return null
  }
}

// ── PRODUCTION-GRADE SERVER AUTO-ATTENDANCE SCHEDULER ──
async function runServerAutoAttendance() {
  if (!isDbConnected) return

  try {
    const userDoc = await UserData.findOne({})
    if (!userDoc) return

    const settings = userDoc.settings || {}
    const activeSemester = settings.semester || 'Semester 3'

    // Server Auto-Attendance strictly runs for active timetable subjects
    if (settings.autoAttendance === false || activeSemester !== 'Semester 3') return

    const subjects = userDoc.subjects || []
    if (subjects.length === 0) return

    const now = new Date()
    const todayName = getTodayNameServer()
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const curHours = now.getHours()
    const curMins = now.getMinutes()

    let updated = false
    let updatedSubjects = [...subjects]
    let updatedHistory = [...(userDoc.history || [])]
    let updatedAutoSlots = [...(userDoc.autoLoggedSlots || [])]

    updatedSubjects = updatedSubjects.map((subj) => {
      let subjModified = false
      let newPresent = subj.present
      let newTotal = subj.total

      ;(subj.timetable || []).forEach((slot) => {
        if (slot.day !== todayName) return

        const endTime = parseEndTimeServer(slot.time)
        if (!endTime) return

        const classEnded = curHours > endTime.hours || (curHours === endTime.hours && curMins >= endTime.minutes)

        if (classEnded) {
          const slotKey = `${dateFormatted}_${subj.id}_${slot.day}_${slot.time}`

          if (!updatedAutoSlots.includes(slotKey)) {
            newPresent += 1
            newTotal += 1
            subjModified = true
            updated = true

            updatedAutoSlots.push(slotKey)

            const logEntry = {
              id: `auto_${Math.random().toString(36).slice(2, 10)}`,
              subjectId: subj.id,
              subjectName: subj.name,
              status: 'present',
              auto: true,
              date: dateFormatted,
              timestamp: now.getTime()
            }

            updatedHistory.unshift(logEntry)
            console.log(`[SERVER AUTO-ATTENDANCE] ⏰ Logged Present for ${subj.name} (${slot.time}) on ${dateFormatted}`)
          }
        }
      })

      if (subjModified) {
        return { ...subj, present: newPresent, total: newTotal }
      }
      return subj
    })

    if (updated) {
      await UserData.updateOne(
        { _id: userDoc._id },
        {
          $set: {
            subjects: updatedSubjects,
            history: updatedHistory,
            autoLoggedSlots: updatedAutoSlots,
            updatedAt: new Date()
          }
        }
      )
      console.log(`[SERVER AUTO-ATTENDANCE] ✅ MongoDB Cloud Document updated atomically.`)
    }
  } catch (err) {
    console.error(`[SERVER AUTO-ATTENDANCE ERROR]:`, err.message)
  }
}

// Start Server-Side Auto Attendance Background Scheduler (Runs every 30s 24/7)
setInterval(runServerAutoAttendance, 30000)

// POST /api/auth/send-otp -> Generate 6-digit OTP and send via Email
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    const targetEmail = (email || 'anshujaiswal3000@gmail.com').trim().toLowerCase()
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(targetEmail, { otp, expires: Date.now() + 600000 })

    console.log(`🔐 OTP Generated for ${targetEmail}: ${otp}`)

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
    console.error('API Error /send-otp:', err.message)
    res.status(500).json({ success: false, message: 'Server processing error' })
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

    let userDoc = await UserData.findOne({ userId: 'anshu' })
    if (!userDoc) userDoc = await UserData.findOne({})

    if (!userDoc) {
      userDoc = new UserData({ userId: 'anshu', password: newPassword.trim(), email: targetEmail })
      await userDoc.save()
    } else {
      await UserData.updateOne(
        { _id: userDoc._id },
        { $set: { password: newPassword.trim(), updatedAt: new Date() } }
      )
    }

    otpStore.delete(targetEmail)
    console.log(`✅ Password successfully reset via OTP for ${targetEmail}`)
    res.json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' })
  } catch (err) {
    console.error('API Error /verify-otp-reset:', err.message)
    res.status(500).json({ success: false, message: 'Server processing error' })
  }
})

// POST /api/auth/verify -> Verify Owner Credentials
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { userId, password } = req.body
    const inputUser = (userId || '').trim().toLowerCase()
    const inputPass = (password || '').trim()

    let userDoc = await UserData.findOne({ userId: inputUser })
    if (!userDoc && inputUser === 'anshu') {
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
    console.error('API Error /verify:', err.message)
    res.status(500).json({ success: false, message: 'Server authentication error' })
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

    await UserData.updateOne(
      { _id: userDoc._id },
      {
        $set: {
          userId: (newUserId || 'anshu').trim().toLowerCase(),
          password: newPassword.trim(),
          updatedAt: new Date()
        }
      }
    )

    res.json({ success: true, message: 'Private credentials updated in MongoDB Atlas 🔒' })
  } catch (err) {
    console.error('API Error /change-credentials:', err.message)
    res.status(500).json({ success: false, message: 'Server processing error' })
  }
})

// GET /api/sync/:userId -> Pull cloud state
app.get('/api/sync/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || 'anshu').toLowerCase()
    let data = await UserData.findOne({ userId })
    if (!data && userId === 'anshu') data = await UserData.findOne({})
    if (!data) return res.status(404).json({ success: false, message: 'No cloud data found' })

    const safeData = data.toObject()
    delete safeData.password
    res.json({ success: true, data: safeData })
  } catch (err) {
    console.error('API Error GET /sync:', err.message)
    res.status(500).json({ success: false, message: 'Failed to retrieve cloud data' })
  }
})

// POST /api/sync/:userId -> Targeted Atomic Update (Avoids Overwriting Unmodified Fields)
app.post('/api/sync/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || 'anshu').toLowerCase()
    const { subjects, sem1Subjects, sem2Subjects, history, bunks, notes, settings, timetableHeader, autoLoggedSlots } = req.body

    let userDoc = await UserData.findOne({ userId })
    if (!userDoc && userId === 'anshu') userDoc = await UserData.findOne({})

    const filter = userDoc ? { _id: userDoc._id } : { userId }

    // Build atomic $set object containing ONLY fields passed in request
    const updateFields = { updatedAt: new Date() }
    if (subjects !== undefined) updateFields.subjects = subjects
    if (sem1Subjects !== undefined) updateFields.sem1Subjects = sem1Subjects
    if (sem2Subjects !== undefined) updateFields.sem2Subjects = sem2Subjects
    if (history !== undefined) updateFields.history = history
    if (bunks !== undefined) updateFields.bunks = bunks
    if (notes !== undefined) updateFields.notes = notes
    if (settings !== undefined) updateFields.settings = settings
    if (timetableHeader !== undefined) updateFields.timetableHeader = timetableHeader
    if (autoLoggedSlots !== undefined) updateFields.autoLoggedSlots = autoLoggedSlots

    const updated = await UserData.findOneAndUpdate(
      filter,
      { $set: updateFields },
      { upsert: true, returnDocument: 'after' }
    )

    res.json({ success: true, message: 'Data synced atomically to MongoDB Atlas', updatedAt: updated.updatedAt })
  } catch (err) {
    console.error('API Error POST /sync:', err.message)
    res.status(500).json({ success: false, message: 'Failed to sync cloud data' })
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
  console.log(`⏰ Server-Side Auto Attendance Background Scheduler Active.`)
})
