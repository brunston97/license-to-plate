import 'dotenv/config'

import express from 'express'
import { FieldValue, Firestore } from '@google-cloud/firestore'
import cors from 'cors'
import { IPlateCard } from './types'
import path from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = parseInt(process.env.VITE_PORT || '8080')
const openRouter = express.Router()

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
    const docRef = db
        .collection('plates')
        .orderBy('voteCount', 'desc')
        .limit(10)

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
    const txtFile = JSON.parse(
        readFileSync(path.join(imagesDir, 'results.txt')).toString()
    )
    //console.log(txtFile)
    res.send(Object.values(txtFile))
})

// Custom route to return specific image by index (e.g., /images/0)

openRouter.get('/images/:imgIndex', async (req, res) => {
    const imgIndex: number = parseInt(req.params.imgIndex)

    // Validate index is a valid number
    if (!imgIndex || isNaN(imgIndex) || imgIndex < 0) {
        res.status(400).json({ error: 'Invalid image index' })
    }

    const index = imgIndex // parseInt(imgIndex)

    // Define image file name (e.g., image_0.jpg, image_1.jpg)
    //const fileName = `image_${index}.jpg` // You can customize this
    const files = readdirSync(imagesDir)

    // Filter only image files (by extension)
    const imageFiles = files
        .filter((file) => {
            const ext = path.extname(file).toLowerCase()
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(
                ext
            )
        })
        .sort()
    const filePath = path.join(imagesDir, imageFiles[index])

    // Check if file exists
    if (!existsSync(filePath)) {
        res.status(404).json({ error: `Image with index ${index} not found` })
    }

    // Send the file as a response
    res.sendFile(filePath)
})

app.use('/api', openRouter)

app.listen(PORT, () => {
    console.log(`helloworld: listening on port ${PORT}`)
})
