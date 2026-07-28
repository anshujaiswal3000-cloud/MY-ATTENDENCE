import mongoose from 'mongoose'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({}, { strict: false })
const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

async function check103() {
  try {
    await mongoose.connect(MONGODB_URI)
    const userDoc = await UserData.findOne({})
    
    console.log('--- SUBJECTS IN MONGODB CLOUD ---')
    let totalPresentSum = 0
    let totalLecturesSum = 0

    userDoc.subjects.forEach((s, i) => {
      if (!s.isIgnored) {
        totalPresentSum += s.present
        totalLecturesSum += s.total
      }
      console.log(`${i + 1}. [${s.id}] ${s.name}: ${s.present}/${s.total} (isIgnored: ${s.isIgnored})`)
    })

    console.log(`\nOverall Academic Present Sum: ${totalPresentSum}`)
    console.log(`Overall Academic Total Sum: ${totalLecturesSum}`)
    console.log(`Total History Logs in DB: ${userDoc.history.length}`)
    console.log(`Total AutoLoggedSlots: ${userDoc.autoLoggedSlots?.length}`)

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

check103()
