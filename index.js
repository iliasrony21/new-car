const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

function verifyJWT (req, res, next) {
  const authHeader = req.headers.authorization
  console.log('inside the jwt', authHeader)
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = authHeader.split('   ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    console.log('decoded', decoded)
    req.decoded = decoded
    next()
  })
  // console.log('inside verifyJWT', authHeader)
}

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
    const orderCollection = client.db('carservice').collection('order')

    //jwt token
    //Auth
    app.post('/login', async (req, res) => {
      const user = req.body
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      })
      res.send({ accessToken })
    })

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

    app.get('/order', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email
      if (email === decodedEmail) {
        const query = { email: email }
        const cursor = orderCollection.find(query)
        const orders = await cursor.toArray()
        res.send(orders)
      } else {
        res.status(403).send({ message: 'forbidden access' })
      }
    })
    //order create api
    app.post('/order', async (req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order)
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
