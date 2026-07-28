import mongoose from 'mongoose'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: 'anshu' },
  subjects: { type: Array, default: [] },
  history: { type: Array, default: [] },
  settings: { type: Object, default: {} },
  autoLoggedSlots: { type: Array, default: [] }
}, { timestamps: true })

const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

async function debugAuto() {
  try {
    await mongoose.connect(MONGODB_URI)
    const userDoc = await UserData.findOne({})
    console.log('--- USER DOC DIAGNOSTICS ---')
    console.log('User ID:', userDoc?.userId)
    console.log('Settings:', JSON.stringify(userDoc?.settings))
    console.log('Auto Logged Slots count:', userDoc?.autoLoggedSlots?.length)
    console.log('DSTL Subject:', JSON.stringify(userDoc?.subjects?.find(s => s.id === 'subj_dstl')))
    
    // Check Tuesday slots
    const dstl = userDoc?.subjects?.find(s => s.id === 'subj_dstl')
    console.log('DSTL Timetable:', JSON.stringify(dstl?.timetable))
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

debugAuto()
