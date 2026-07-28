import mongoose from 'mongoose'
import dns from 'dns'
import { defaultSubjects, generateSeedHistory } from '../src/data/defaultSubjects.js'

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

async function syncOfficialPdfTimetableAndHistory() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas Cloud!')

    let userDoc = await UserData.findOne({ userId: 'anshu' })
    if (!userDoc) userDoc = await UserData.findOne({})

    if (!userDoc) {
      console.error('❌ User document not found!')
      process.exit(1)
    }

    const historyLogs = generateSeedHistory(defaultSubjects)
    const autoLoggedSlots = historyLogs.map(h => `${h.date}_${h.subjectId}`)

    await UserData.updateOne(
      { _id: userDoc._id },
      {
        $set: {
          subjects: defaultSubjects,
          history: historyLogs,
          autoLoggedSlots,
          updatedAt: new Date()
        }
      }
    )

    console.log(`✅ Official PDF Timetable (W.E.F 26/07/2026) & ${historyLogs.length} Date Logs (14/07/2026 to 28/07/2026) synced to MongoDB Atlas Cloud!`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Sync Error:', err.message)
    process.exit(1)
  }
}

syncOfficialPdfTimetableAndHistory()
