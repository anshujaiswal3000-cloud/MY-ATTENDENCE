import mongoose from 'mongoose'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const MONGODB_URI = 'mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority'

const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'anshu' }
}, { strict: false })

const UserData = mongoose.models.UserData || mongoose.model('UserData', userDataSchema)

async function cleanupDuplicateDocs() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas Cloud!')

    const docs = await UserData.find({}).sort({ updatedAt: -1 })
    console.log(`Found ${docs.length} documents in MongoDB Atlas.`)

    if (docs.length > 1) {
      // Keep the most recently updated document (docs[0]), delete the rest
      const keepDoc = docs[0]
      const deleteIds = docs.slice(1).map(d => d._id)

      await UserData.deleteMany({ _id: { $in: deleteIds } })
      console.log(`✅ Deleted ${deleteIds.length} stale duplicate documents! Kept document ID: ${keepDoc._id} (userId: ${keepDoc.userId})`)
    } else {
      console.log('ℹ️ Exactly 1 document exists in MongoDB Atlas.')
    }

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

cleanupDuplicateDocs()
