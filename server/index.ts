import 'dotenv/config'

import express from 'express'
import { FieldValue, Firestore } from '@google-cloud/firestore'
import cors from 'cors'
import { IPlateCard, Image } from './types'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { SQLiteImageManager } from './plateManager'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = parseInt(process.env.VITE_PORT || '8080')
const openRouter = express.Router()

app.use(express.json())
app.use(cors())

const db = new Firestore({
  projectId: 'license2plate-b4c6e',
  keyFilename: process.env.KEY_FILE_PATH
})

const DB_NAME = path.join('..', 'parsePlates/source/images/plates.db')

const localDb = new SQLiteImageManager(DB_NAME)
localDb.createTable()

// Serve static files from a directory (e.g., 'images')
//const imagesDir = path.join(__dirname, '..', 'parsePlates/source/images') // Make sure this directory exists
const imagesDir = path.join(__dirname, '..', 'parsePlates/source/images')

openRouter.get('/', (req, res) => {
  res.send(`Hello ${req.ip}!`)
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

openRouter.get('/vote/results', async (req, res) => {
  const docRef = db.collection('plates').orderBy('voteCount', 'desc').limit(10)

  try {
    const querySnapshot = await docRef.get()
    const results = querySnapshot.docs.map((doc) => {
      const toReturn = doc.data() as IPlateCard
      console.log(toReturn)
      return toReturn
    })
    res.json(results)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

/// local image management for tagging
// Middleware to serve static files from 'images' directory
openRouter.use('/images', express.static(imagesDir))

openRouter.get('/images', async (req, res) => {
  try {
    const images = await localDb.getAllImages()
    res.json(images)
  } catch (error) {
    res.status(500).json(error)
  }
})

// Custom route to return specific image by index (e.g., /images/0)

openRouter.get('/images/info/:id', async (req, res) => {
  const { id } = req.params
  try {
    const fileInfo = await localDb.getImgById(id)
    res.json(fileInfo).end()
  } catch (error) {
    res.status(500).json(error)
  }
})

openRouter.get('/images/:id', async (req, res) => {
  const { id } = req.params
  try {
    const fileInfo = await localDb.getImgById(id)
    if (fileInfo) {
      const filePath = path.join(imagesDir, fileInfo.fileName)
      res.sendFile(filePath)
      if (!existsSync(filePath)) {
        res.status(404).json({ error: `File does not exists` })
      }
    } else {
      res.status(404).json({ error: `Image with id ${id} not found` })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// Save text to a database or file
openRouter.post('/save-text', async (req, res) => {
  const { id, text, correctedText, fileName } = req.body as Image
  try {
    await localDb.updateImage({ id, text, correctedText, fileName })
    res.status(200).json({ success: true, message: 'Text saved successfully' })
  } catch (error) {
    res.status(500).json(error)
  }
})

app.use('/api', openRouter)

app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`)
})
