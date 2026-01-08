import 'dotenv/config'

import express from 'express'
import { FieldValue, Firestore } from '@google-cloud/firestore'
import cors from 'cors'
import { IPlateCard, Image } from './types'
import path from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

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
    res.status(500).send(error)
  }
})

// Middleware to serve static files from 'images' directory
openRouter.use('/images', express.static(imagesDir))

openRouter.get('/images', async (req, res) => {
  const mockDbPath = path.join(imagesDir, 'resultsDB.json')

  if (
    !existsSync(mockDbPath) &&
    existsSync(path.join(imagesDir, 'results.json'))
  ) {
    const originalExport = Object.values(
      JSON.parse(readFileSync(path.join(imagesDir, 'results.json')).toString())
    ) as Image[]
    writeFileSync(mockDbPath, JSON.stringify(originalExport))
  }
  const allImages = Object.values(
    JSON.parse(readFileSync(mockDbPath).toString())
  ) as Image[]
  res.send(allImages).end()
})

// Custom route to return specific image by index (e.g., /images/0)

openRouter.get('/images/info/:id', async (req, res) => {
  const { id } = req.params
  const fileInfo = getImageInfo(parseInt(id))
  res.send(fileInfo).end()
})

function getImageInfo(id: number): Image | undefined {
  const allImages = Object.values(
    JSON.parse(readFileSync(path.join(imagesDir, 'resultsDB.json')).toString())
  ) as Image[]
  const fileInfo = allImages.find((x) => x.id == id)
  return fileInfo
}

openRouter.get('/images/:id', async (req, res) => {
  const id: number = parseInt(req.params.id)
  //const { imgIndex } = req.params
  // Validate index is a valid number
  if (!id || isNaN(id) || id < 0) {
    res.status(400).json({ error: 'Invalid image index' })
  }

  const imageInfo = getImageInfo(id)
  if (imageInfo) {
    const filePath = path.join(imagesDir, imageInfo.fileName)

    res.sendFile(filePath)
    if (!existsSync(filePath)) {
      res.status(404).json({ error: `File does not exists` })
    }
  } else {
    res.status(404).json({ error: `Image with id ${id} not found` })
  }
})

// Save text to a database or file
openRouter.post('/save-text', (req, res) => {
  console.log(req.body)
  const { id, text, correctedText, fileName } = req.body as Image
  console.log('Saving:', { id, text })

  const mockDbPath = path.join(imagesDir, 'resultsDB.json')

  const preText = readFileSync(mockDbPath).toString()
  const info: { [key: string]: Image } = JSON.parse(preText) || {}
  console.log(typeof info)
  const toChange = info[fileName]
  if (toChange) {
    toChange.correctedText = correctedText
    writeFileSync(mockDbPath, JSON.stringify(info))
  }
  // if (toChangeIndex != -1) {
  //   const toChange = info[toChangeIndex]
  //   toChange.correctedText = text
  // } else {
  // const temp: Image = {
  //   id: id,
  //   correctedText: correctedText,
  //   text: text,
  //   fileName: fileName
  // }
  //   info.push(temp)
  // }

  res.status(200).json({ success: true, message: 'Text saved successfully' })
})

app.use('/api', openRouter)

app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`)
})
