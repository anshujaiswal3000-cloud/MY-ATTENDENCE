import mongoose from 'mongoose'
import dns from 'dns'
import { defaultSubjects } from '../src/data/defaultSubjects.js'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({}, { strict: false })
const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

const SUBJECT_ID_MAP = {
  'BCC-302': 'subj_python',
  'BCS-301': 'subj_ds',
  'BCS-302': 'subj_co',
  'BCS-303': 'subj_dstl',
  'BCS-351': 'subj_dslab',
  'BCS-352': 'subj_colab',
  'BCS-353': 'subj_wdwlab',
  'BOE-310': 'subj_dld',
  'BVE-301': 'subj_uhv',
  'ENG[HS]-2': 'subj_enghs',
  'ENG[SS]-2': 'subj_engss',
  'LIBRARY-2': 'subj_lib',
  'LR-2': 'subj_lr',
  'PSD-2': 'subj_psd',
  'QUANTS-2': 'subj_quants',
  'SKILL-2': 'subj_skillai'
}

// ── TIMETABLE 1 (Week 1: W.E.F 13/07/2026 to 19/07/2026) ──
const timetableWeek1 = {
  Monday: [
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BCC-302', name: 'PYTHON (PYTHON)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-352', name: 'COMPUTER ORGANIZATION LAB (CO_LAB)', time: '11:30 AM - 01:10 PM', isLab: true, inc: 2 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'LR-2', name: 'LOGICAL REASONING (LR)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Tuesday: [
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-351', name: 'DATA STRUCTURES LAB (DS_LAB)', time: '11:30 AM - 01:10 PM', isLab: true, inc: 2 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'LIBRARY-2', name: 'LIBRARY (LIB)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Wednesday: [
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '11:30 AM - 12:20 PM', isLab: false, inc: 1 },
    { code: 'BVE-301', name: 'UNIVERSAL HUMAN VALUES (UHV)', time: '12:20 PM - 01:10 PM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'QUANTS-2', name: 'QUANTS (QUANTS)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Thursday: [
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BVE-301', name: 'UNIVERSAL HUMAN VALUES (UHV)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '11:30 AM - 12:20 PM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '12:20 PM - 01:10 PM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'ENG[SS]-2', name: 'ENG SOFT SKILL (ENG_SS)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'SKILL-2', name: 'SKILL AI (SKILL_AI)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Friday: [
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'SKILL-2', name: 'SKILL AI (SKILL_AI)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '11:30 AM - 12:20 PM', isLab: false, inc: 1 },
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '12:20 PM - 01:10 PM', isLab: false, inc: 1 },
    { code: 'ENG[HS]-2', name: 'ENG HARD SKILL (ENG_HS)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'BCS-353', name: 'WEB DESIGNING WORKSHOP LAB (WDW_LAB)', time: '02:50 PM - 04:30 PM', isLab: true, inc: 2 }
  ],
  Saturday: [
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:00 AM - 10:00 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '10:00 AM - 11:00 AM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '11:00 AM - 12:00 PM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '12:00 PM - 01:00 PM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '02:00 PM - 03:00 PM', isLab: false, inc: 1 },
    { code: 'BCC-302', name: 'PYTHON (PYTHON)', time: '03:00 PM - 04:00 PM', isLab: false, inc: 1 }
  ]
}

// ── TIMETABLE 2 (Week 2 & 3: W.E.F 26/07/2026 onwards) ──
const timetableWeek23 = {
  Monday: [
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BCC-302', name: 'PYTHON (PYTHON)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-352', name: 'COMPUTER ORGANIZATION LAB (CO_LAB)', time: '11:30 AM - 01:10 PM', isLab: true, inc: 2 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'LR-2', name: 'LOGICAL REASONING (LR)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Tuesday: [
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-351', name: 'DATA STRUCTURES LAB (DS_LAB)', time: '11:30 AM - 01:10 PM', isLab: true, inc: 2 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'BCC-302', name: 'PYTHON (PYTHON)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Wednesday: [
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '11:30 AM - 12:20 PM', isLab: false, inc: 1 },
    { code: 'BVE-301', name: 'UNIVERSAL HUMAN VALUES (UHV)', time: '12:20 PM - 01:10 PM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'QUANTS-2', name: 'QUANTS (QUANTS)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Thursday: [
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BVE-301', name: 'UNIVERSAL HUMAN VALUES (UHV)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '11:30 AM - 12:20 PM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '12:20 PM - 01:10 PM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'ENG[HS]-2', name: 'ENG HARD SKILL (ENG_HS)', time: '02:50 PM - 03:40 PM', isLab: false, inc: 1 },
    { code: 'SKILL-2', name: 'SKILL AI (SKILL_AI)', time: '03:40 PM - 04:30 PM', isLab: false, inc: 1 }
  ],
  Friday: [
    { code: 'ENG[HS]-2', name: 'ENG HARD SKILL (ENG_HS)', time: '09:00 AM - 09:50 AM', isLab: false, inc: 1 },
    { code: 'SKILL-2', name: 'SKILL AI (SKILL_AI)', time: '09:50 AM - 10:40 AM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '10:40 AM - 11:30 AM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '11:30 AM - 12:20 PM', isLab: false, inc: 1 },
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '12:20 PM - 01:10 PM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '02:00 PM - 02:50 PM', isLab: false, inc: 1 },
    { code: 'BCS-353', name: 'WEB DESIGNING WORKSHOP LAB (WDW_LAB)', time: '02:50 PM - 04:30 PM', isLab: true, inc: 2 }
  ],
  Saturday: [
    { code: 'BCS-302', name: 'COMPUTER ORGANIZATION (CO)', time: '09:00 AM - 10:00 AM', isLab: false, inc: 1 },
    { code: 'BCS-303', name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)', time: '10:00 AM - 11:00 AM', isLab: false, inc: 1 },
    { code: 'PSD-2', name: 'PSD (PSD)', time: '11:00 AM - 12:00 PM', isLab: false, inc: 1 },
    { code: 'BOE-310', name: 'DIGITAL LOGIC DESIGN (DLD)', time: '12:00 PM - 01:00 PM', isLab: false, inc: 1 },
    { code: 'BCS-301', name: 'DATA STRUCTURE (DS)', time: '02:00 PM - 03:00 PM', isLab: false, inc: 1 },
    { code: 'LIBRARY-2', name: 'LIBRARY (LIB)', time: '03:00 PM - 04:00 PM', isLab: false, inc: 1 }
  ]
}

async function fixHistorySubjectIds() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas Cloud!')

    const userDoc = await UserData.findOne({})
    if (!userDoc) process.exit(1)

    const historyLogs = []
    const subjectCounts = {}

    // Date range: 13/07/2026 to 28/07/2026
    const startDate = new Date('2026-07-13T09:00:00')
    const endDate = new Date('2026-07-28T14:50:00')

    let cur = new Date(startDate)

    while (cur <= endDate) {
      const dayOfWeek = cur.getDay()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = dayNames[dayOfWeek]
      const dayNum = cur.getDate()

      // Exclude Sundays, 1st Saturdays, and 3rd Saturdays
      const isSunday = dayOfWeek === 0
      const isFirstSaturday = dayOfWeek === 6 && dayNum <= 7
      const isThirdSaturday = dayOfWeek === 6 && dayNum >= 15 && dayNum <= 21

      if (!isSunday && !isFirstSaturday && !isThirdSaturday) {
        const dFormatted = `${String(cur.getDate()).padStart(2, '0')}/${String(cur.getMonth() + 1).padStart(2, '0')}/${cur.getFullYear()}`
        
        // Select Timetable 1 for Week 1 (13/07 - 19/07), Timetable 2 for Week 2/3 (20/07 - 28/07)
        const isWeek1 = cur < new Date('2026-07-20T00:00:00')
        const activeTt = isWeek1 ? timetableWeek1 : timetableWeek23
        const daySlots = activeTt[dayName] || []

        daySlots.forEach(slot => {
          const exactSubjectId = SUBJECT_ID_MAP[slot.code] || `subj_${slot.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`

          // For today (28/07/2026), include slots up to P7 (02:50 PM)
          if (dFormatted === '28/07/2026') {
            if (['09:00 AM - 09:50 AM', '09:50 AM - 10:40 AM', '10:40 AM - 11:30 AM', '11:30 AM - 01:10 PM', '02:00 PM - 02:50 PM'].includes(slot.time)) {
              if (!subjectCounts[slot.code]) subjectCounts[slot.code] = { present: 0, total: 0, name: slot.name, id: exactSubjectId }
              subjectCounts[slot.code].present += slot.inc
              subjectCounts[slot.code].total += slot.inc

              historyLogs.push({
                id: `hist_${Math.random().toString(36).slice(2, 10)}`,
                subjectId: exactSubjectId,
                subjectName: slot.name,
                status: 'present',
                auto: true,
                isLab: slot.isLab,
                increment: slot.inc,
                date: dFormatted,
                timestamp: cur.getTime()
              })
            }
          } else {
            if (!subjectCounts[slot.code]) subjectCounts[slot.code] = { present: 0, total: 0, name: slot.name, id: exactSubjectId }
            subjectCounts[slot.code].present += slot.inc
            subjectCounts[slot.code].total += slot.inc

            historyLogs.push({
              id: `hist_${Math.random().toString(36).slice(2, 10)}`,
              subjectId: exactSubjectId,
              subjectName: slot.name,
              status: 'present',
              auto: true,
              isLab: slot.isLab,
              increment: slot.inc,
              date: dFormatted,
              timestamp: cur.getTime()
            })
          }
        })
      }

      cur.setDate(cur.getDate() + 1)
    }

    console.log('\n========================================')
    console.log('📊 ACCURATE DUAL-WEEK ATTENDANCE SUMMARY WITH EXACT SUBJECT IDs')
    console.log('========================================')
    Object.keys(subjectCounts).forEach(code => {
      const s = subjectCounts[code]
      console.log(`${code} [${s.id}] | ${s.name}: ${s.present}/${s.total}`)
    })
    console.log(`Total History Logs: ${historyLogs.length}`)
    console.log('========================================\n')

    // Build official subject array for DB
    const existingSubjects = userDoc.subjects || defaultSubjects
    const updatedSubjectsList = existingSubjects.map(sub => {
      const count = subjectCounts[sub.code]
      if (count) {
        return { ...sub, present: count.present, total: count.total }
      }
      return sub
    })

    const autoLoggedSlots = historyLogs.map(h => `${h.date}_${h.subjectId}`)

    await UserData.updateOne(
      { _id: userDoc._id },
      {
        $set: {
          subjects: updatedSubjectsList,
          history: historyLogs.reverse(),
          autoLoggedSlots,
          updatedAt: new Date()
        }
      }
    )

    console.log('✅ History Subject IDs & Dual Timetable Data Perfectly Fixed in MongoDB Atlas!')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

fixHistorySubjectIds()
