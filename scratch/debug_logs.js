import mongoose from 'mongoose'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({}, { strict: false })
const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

async function debugLogs() {
  try {
    await mongoose.connect(MONGODB_URI)
    const userDoc = await UserData.findOne({})
    const history = userDoc?.history || []

    console.log(`Total History Logs in MongoDB Cloud: ${history.length}`)
    console.log('\n--- TOP 10 LOGS ---')
    history.slice(0, 10).forEach((h, i) => {
      console.log(`${i + 1}. ID: ${h.id} | Date: ${h.date} | SubjId: ${h.subjectId} | SubjName: ${h.subjectName} | Status: ${h.status}`)
    })

    console.log('\n--- BOTTOM 5 LOGS ---')
    history.slice(-5).forEach((h, i) => {
      console.log(`${i + 1}. ID: ${h.id} | Date: ${h.date} | SubjId: ${h.subjectId} | SubjName: ${h.subjectName} | Status: ${h.status}`)
    })

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

debugLogs()
