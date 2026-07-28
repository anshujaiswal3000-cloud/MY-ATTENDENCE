import mongoose from 'mongoose'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: 'anshu' },
  password: { type: String, default: '123456' },
  email: { type: String, default: 'anshujaiswal3000@gmail.com' },
  subjects: { type: Array, default: [] },
  history: { type: Array, default: [] },
  bunks: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  settings: { type: Object, default: {} },
  autoLoggedSlots: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

async function seedTuesdayAttendance() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas Cloud!')

    let userDoc = await UserData.findOne({ userId: 'anshu' })
    if (!userDoc) userDoc = await UserData.findOne({})

    if (!userDoc) {
      console.error('❌ User document not found!')
      process.exit(1)
    }

    const todayDate = '28/07/2026'
    let subjects = userDoc.subjects || []
    let history = userDoc.history || []
    let autoLoggedSlots = userDoc.autoLoggedSlots || []

    const coSlot = `${todayDate}_subj_co_Tuesday_09:00 AM - 09:50 AM`
    const dsSlot = `${todayDate}_subj_ds_Tuesday_10:40 AM - 11:30 AM`
    const dsLabSlot = `${todayDate}_subj_dslab_Tuesday_11:30 AM - 01:10 PM`

    let updated = false

    subjects = subjects.map((sub) => {
      if (sub.id === 'subj_co' && !autoLoggedSlots.includes(coSlot)) {
        sub.present += 1
        sub.total += 1
        autoLoggedSlots.push(coSlot)
        history.unshift({
          id: `auto_${Math.random().toString(36).slice(2, 10)}`,
          subjectId: 'subj_co',
          subjectName: 'COMPUTER ORGANIZATION (CO)',
          status: 'present',
          auto: true,
          isLab: false,
          increment: 1,
          date: todayDate,
          timestamp: Date.now()
        })
        updated = true
      }
      if (sub.id === 'subj_ds' && !autoLoggedSlots.includes(dsSlot)) {
        sub.present += 1
        sub.total += 1
        autoLoggedSlots.push(dsSlot)
        history.unshift({
          id: `auto_${Math.random().toString(36).slice(2, 10)}`,
          subjectId: 'subj_ds',
          subjectName: 'DATA STRUCTURE (DS)',
          status: 'present',
          auto: true,
          isLab: false,
          increment: 1,
          date: todayDate,
          timestamp: Date.now()
        })
        updated = true
      }
      if (sub.id === 'subj_dslab' && !autoLoggedSlots.includes(dsLabSlot)) {
        sub.present += 2
        sub.total += 2
        autoLoggedSlots.push(dsLabSlot)
        history.unshift({
          id: `auto_${Math.random().toString(36).slice(2, 10)}`,
          subjectId: 'subj_dslab',
          subjectName: 'DATA STRUCTURES LAB (DS_LAB)',
          status: 'present',
          auto: true,
          isLab: true,
          increment: 2,
          date: todayDate,
          timestamp: Date.now()
        })
        updated = true
      }
      return sub
    })

    if (updated) {
      await UserData.updateOne(
        { _id: userDoc._id },
        {
          $set: {
            subjects,
            history,
            autoLoggedSlots,
            updatedAt: new Date()
          }
        }
      )
      console.log('✅ Tuesday 28/07/2026 attendance & history logs successfully seeded to MongoDB Atlas Cloud!')
    } else {
      console.log('ℹ️ Tuesday logs already exist in MongoDB Atlas.')
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

seedTuesdayAttendance()
