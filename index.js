const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fzvl6.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
})
async function run () {
  try {
    await client.connect()
    const serviceCollection = client.db('carservice').collection('service')

    //Find multiple services
    app.get('/service', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const services = await cursor.toArray()
      res.send(services)
    })
    //Find one services
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })
    //Insert a document/ add a service
    app.post('/service', async (req, res) => {
      const newUser = req.body
      const result = await serviceCollection.insertOne(newUser)
      res.send(result)
    })
    //Delete a service
    app.delete('/service/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await serviceCollection.deleteOne(query)
      res.send(result)
    })
  } finally {
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Running car service')
})
app.listen(port, () => {
  console.log('listenning to port', port)
})
