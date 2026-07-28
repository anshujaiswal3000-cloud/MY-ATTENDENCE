import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import cors from 'cors'
import nodemailer from 'nodemailer'

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

// ── TIMEZONE-AWARE SERVER HELPER UTILITIES (Asia/Kolkata IST) ──
function getISTDate() {
  const dateStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  return new Date(dateStr)
}

function getTodayNameServer() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const istDate = getISTDate()
  return days[istDate.getDay()]
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

// ── RENDER 24/7 KEEP-ALIVE SELF-PINGER (Prevents Render Server Sleep Permanently) ──
function startKeepAlivePinger() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || 'https://my-attendence.onrender.com/api/sync/anshu'
  
  // Self-ping every 5 minutes (300,000 ms) so Render NEVER sleeps
  setInterval(async () => {
    try {
      const res = await fetch(targetUrl)
      if (res.ok) {
        console.log(`[KEEP-ALIVE ⚡] Self-ping successful — Server 100% Awake 24/7!`)
      }
    } catch (err) {
      console.warn(`[KEEP-ALIVE NOTICE]:`, err.message)
    }
  }, 5 * 60 * 1000)
}

startKeepAlivePinger()

// ── ADVANCED TIMEZONE-AWARE SERVER AUTO-ATTENDANCE SCHEDULER (WITH MASS BUNK PROTECTION & LAB +2 LOGIC) ──
async function runServerAutoAttendance() {
  if (!isDbConnected) return

  try {
    const userDoc = await UserData.findOne({})
    if (!userDoc) return

    const settings = userDoc.settings || {}
    const activeSemester = settings.semester || 'Semester 3'

    // Server Auto-Attendance strictly runs for active timetable subjects
    // ADVANCED GUARD: Skips auto-logging if autoAttendance is disabled, massBunkToday is active, or semester isn't Sem 3
    if (settings.autoAttendance === false || settings.massBunkToday === true || activeSemester !== 'Semester 3') return

    const subjects = userDoc.subjects || []
    if (subjects.length === 0) return

    const now = getISTDate()
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

      // LAB subjects count as 2 continuous classes (+2 Present, +2 Total)
      const isLab = subj.isLab || subj.name.toLowerCase().includes('lab')
      const increment = isLab ? 2 : 1

      ;(subj.timetable || []).forEach((slot) => {
        if (slot.day !== todayName) return

        const endTime = parseEndTimeServer(slot.time)
        if (!endTime) return

        const classEnded = curHours > endTime.hours || (curHours === endTime.hours && curMins >= endTime.minutes)

        if (classEnded) {
          const slotKey = `${dateFormatted}_${subj.id}_${slot.day}_${slot.time}`

          if (!updatedAutoSlots.includes(slotKey)) {
            newPresent += increment
            newTotal += increment
            subjModified = true
            updated = true

            updatedAutoSlots.push(slotKey)

            const logEntry = {
              id: `auto_${Math.random().toString(36).slice(2, 10)}`,
              subjectId: subj.id,
              subjectName: subj.name,
              status: 'present',
              auto: true,
              isLab: isLab,
              increment: increment,
              date: dateFormatted,
              timestamp: now.getTime()
            }

            updatedHistory.unshift(logEntry)
            console.log(`[ADVANCED AUTO-ATTENDANCE IST] ⏰ Logged Present (+${increment}) for ${subj.name} (${slot.time}) on ${dateFormatted}`)
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
      console.log(`[ADVANCED AUTO-ATTENDANCE IST] ✅ MongoDB Cloud Document updated atomically.`)
    }
  } catch (err) {
    console.error(`[ADVANCED AUTO-ATTENDANCE ERROR]:`, err.message)
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
app.use(express.static(distPath))
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(503).send('App is building... Please refresh in a few seconds.')
  }
})

app.listen(PORT, () => {
  console.log(`🚀 AttendX Server running on http://localhost:${PORT}`)
  console.log(`⏰ Timezone-Aware (IST) Server Auto Attendance Background Scheduler Active.`)
  console.log(`⚡ 24/7 Keep-Alive Self-Pinger Active (Prevents Render Server Sleep).`)
})
