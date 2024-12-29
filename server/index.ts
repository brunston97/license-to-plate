import express from 'express'
import { FieldValue, Firestore } from '@google-cloud/firestore'

const app = express()
const PORT = parseInt(process.env.PORT ?? '8080')
const openRouter = express.Router()

const db = new Firestore({
  projectId: 'license2plate-b4c6e',
  keyFilename: process.env.KEY_FILE_PATH
})

openRouter.get('/', (req, res) => {
  //const name = process.env.NAME || 'World'
  res.send(`Hello ${req.ip}!`)
})

interface voteBody {
  id: string
}

openRouter.post('/vote/:id', async (req, res) => {
  const { id } = req.params as voteBody
  console.log(`${id} has been voted`)
  const docRef = db.collection('plates').doc(id)
  const { exists } = await docRef.get()
  try {
    if (!exists) {
      await docRef.set({
        voteCount: 0
      })
    }
    await docRef.collection('votes').add({ time: Date.now() })
    await docRef.update({
      voteCount: FieldValue.increment(1)
    })
  } catch (error) {
    console.log(error)
  }

  //const snapshot = await docRef.get()
  // if (docRef.) {
  //   await docRef.set(snapshot.data().id + 1)
  // }

  res.send(id)
})
app.use('/api', openRouter)

app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`)
})
