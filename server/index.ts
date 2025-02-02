import express from 'express'
import { FieldValue, Firestore } from '@google-cloud/firestore'
import { IPlateCard } from './types'
import cors from 'cors'
import process from 'process'

const app = express()
const PORT = parseInt(process.env.VITE_PORT || '8000')
console.log(process.env)
const openRouter = express.Router()

app.use(cors())

const db = new Firestore({
  projectId: 'license2plate-b4c6e',
  keyFilename: process.env.KEY_FILE_PATH
})

openRouter.get('/', (req, res) => {
  res.send(`Hello ${req.ip}!`)
})

openRouter.get('/plates', async (req, res) => {
  return res.json([])
  const snapshot = await db.collection('plates').get()
  if (snapshot.empty) {
    res.json([])
  }
  const plates: IPlateCard[] = []
  snapshot.forEach((plate) => {
    const p = plate.data()
    if (p.id == undefined) {
      const temp = {
        id: plate.id,
        voteCount: 0,
        uploader: 'garlicgirl'
      }
      plate.ref.set(temp)
      plates.push(temp)
    } else {
      plates.push(p as IPlateCard)
    }
  })

  res.json(plates)
})

interface voteBody {
  id: string
}

openRouter.post('/vote/:id', async (req, res) => {
  const { id } = req.params as voteBody
  console.log(`${id} has been voted`)
  const docRef = db.collection('plates').doc(id)
  try {
    await docRef.collection('votes').add({ time: Date.now() })
    await docRef.update({
      voteCount: FieldValue.increment(1)
    })
  } catch (error) {
    console.log(error)
  }

  res.send(id)
})
app.use('/api', openRouter)

app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`)
})
