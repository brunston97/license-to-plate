import admin from 'firebase-admin'
import serviceAccount from './license2plate_key.json' assert { type: 'json' }

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function deleteAllDocuments() {
  try {
    const snapshot = await db.collection('plates').get()
    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete())
    await Promise.all(deletePromises)
    console.log('All documents deleted successfully!')
  } catch (error) {
    console.error('Error deleting documents: ', error)
  }
}

deleteAllDocuments()
