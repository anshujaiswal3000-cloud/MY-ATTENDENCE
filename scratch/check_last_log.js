import mongoose from 'mongoose'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({}, { strict: false })
const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

async function checkLastLog() {
  try {
    await mongoose.connect(MONGODB_URI)
    const userDoc = await UserData.findOne({})
    const history = userDoc?.history || []

    console.log('========================================')
    console.log('🔍 LATEST LOGS DIAGNOSTIC (TOP 5)')
    console.log('========================================')

    history.slice(0, 5).forEach((h, i) => {
      const timeFormatted = h.timestamp ? new Date(h.timestamp).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) : 'N/A'
      console.log(`${i + 1}. [${h.date} ${timeFormatted}] ${h.subjectName}`)
      console.log(`   - Status: ${h.status}`)
      console.log(`   - Mode: ${h.auto ? '🤖 AUTO-MARKED BY SERVER' : '🖐️ MANUALLY MARKED BY USER'}`)
      console.log(`   - Log ID: ${h.id}`)
      console.log('----------------------------------------')
    })

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

checkLastLog()
