import admin from 'firebase-admin'

const collectionName = 'plates2025'

import serviceAccount from './license2plate_key.json' assert { type: 'json' }

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

const snapshot = await db.collection(collectionName).get()

snapshot.forEach(async (doc) => {
  try {
    const docRef = db.collection(collectionName).doc(doc.id)
    await docRef.update({
      voteCount: 0
    })
  } catch (error) {
    console.error(`Error updating document ${doc.id}:`, error)
  }
})
