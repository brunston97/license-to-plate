import express from 'express'
const app = express()
const PORT = parseInt(process.env.PORT ?? '8080')
const openRouter = express.Router()

openRouter.get('/', (req, res) => {
  //const name = process.env.NAME || 'World'
  res.send(`Hello ${req.ip}!`)
})

interface voteBody {
  id: string
}

openRouter.post('/vote/:id', (req, res) => {
  const { id } = req.params as voteBody
  console.log(`${id} has been voted`)
  res.send('id')
})
app.use('/api', openRouter)

app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`)
})
