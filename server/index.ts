import 'dotenv/config'

import express from 'express'
import { FieldValue, Firestore } from '@google-cloud/firestore'
import cors from 'cors'
import { IPlateCard, Image } from './types'
import path, { join } from 'path'
import { existsSync, readdirSync } from 'fs'
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
  projectId: 'license2plate-b4c6e'
  //keyFilename: process.env.KEY_FILE_PATH
})

const COLLECTION_NAME = 'plates2025'
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

/**
 * Vote for x Id
 * @param id // the plateId to vote for
 */
openRouter.post('/vote/:id', async (req, res) => {
  const { id } = req.params as voteBody
  //console.log(`${id} has been voted`)
  const docRef = db.collection(COLLECTION_NAME).doc(id)
  try {
    await docRef.collection('votes').add({ time: Date.now() })
    await docRef.update({
      voteCount: FieldValue.increment(1)
    })
    res.send(id)
  } catch (error) {
    res.status(500).json(error)
    //console.log(error)
  }
})

/**
 * Get the top 24 plates
 */
openRouter.get('/vote/results', async (req, res) => {
  const docRef = db
    .collection(COLLECTION_NAME)
    .orderBy('voteCount', 'desc')
    .limit(24)

  try {
    const querySnapshot = await docRef.get()
    const results = querySnapshot.docs.map((doc) => {
      const toReturn = doc.data() as IPlateCard
      //console.log(toReturn)
      return toReturn
    })
    res.json(results)
  } catch (error) {
    //console.log(error)
    res.status(500).json(error)
  }
})

/**
 * Get plates for the frontend
 */
openRouter.get('/plates', async (req, res) => {
  const docRef = db.collection(COLLECTION_NAME)

  try {
    const querySnapshot = await docRef.get()
    const plates = querySnapshot.docs.map((doc) => {
      const plate = doc.data() as IPlateCard
      return plate
    })
    res.json(plates)
  } catch (error) {
    //console.log(error)
    res.status(500).json(error)
  }
})

//#region localEndpoints
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
      const filePath = path.join(
        imagesDir,
        'output/detectedPlates',
        fileInfo.fileName
      )
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
  const { id, text, correctedText, fileName, user } = req.body as Image
  try {
    await localDb.updateImage({ id, text, correctedText, fileName, user })
    res.status(200).json(req.body)
  } catch (error) {
    res.status(500).json(error)
  }
})

openRouter.get('/sync', async (req, res) => {
  //const collection = db.collection(COLLECTION_NAME)
  let images = (await localDb.getAllImages()) as IPlateCard[]
  images = images
    .filter((x) => x.correctedText != 'NAN')
    .sort((a, b) => a.id - b.id)
  const filesPath = join(
    __dirname,
    '..',
    'parsePlates/source/images/input/2025'
  )
  const userMap: { [key: string]: string } = {}
  const files = readdirSync(filesPath, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      const userFiles = readdirSync(join(filesPath, file.name)).filter((x) =>
        x.endsWith('.jpg')
      )
      userFiles.forEach((f) => {
        userMap[f] = file.name
      })
      //userMap[file.name] = userFiles.filter((x) => x.endsWith('.jpg'))
    }
  }

  for (const image of images) {
    image.user = userMap[image.fileName] ?? ''
    image.voteCount = 0
    image.id = parseInt(image.fileName.match(/\d+/g)?.at(0) ?? '-1')
    //if(image.correctedText)

    //console.log(image)
    //if (image.user) {
    //await localDb.updateImage(image)
    //}
  }
  images = images.sort((a, b) => a.id - b.id)
  // for (const image of images) {
  //   await collection.doc(image.id.toString()).set(image)
  // }
  //console.log(userMap)
  res.json(images)
})
//#endregion localEndpoints

app.use('/api', openRouter)

app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`)
})
