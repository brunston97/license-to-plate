import admin from 'firebase-admin'
import fs from 'fs'

import serviceAccount from './license2plate_key.json' assert { type: 'json' }

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

const jsonFilePath = './Plate_Zone_Plates.json'

fs.readFile(jsonFilePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading the JSON file: ', err)
    return
  }

  const jsonData = JSON.parse(data)

  const collectionName = 'plates'

  const batch = db.batch()

  jsonData.forEach((item) => {
    const docRef = db.collection(collectionName).doc(item.id)
    batch.set(docRef, item)
  })

  try {
    await batch.commit()
    console.log('Data successfully uploaded to Firestore!')
    await addAndInitializeVoteCountField(collectionName)
  } catch (error) {
    console.error('Error uploading data to Firestore: ', error)
  }
})

async function addAndInitializeVoteCountField(collectionName) {
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
}
