const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gflsp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        

        const userCollection = client.db('top_gear_perform').collection('users')

        app.get('/user/:email',async(req,res)=>{
            const email = req.params.email
            const query = {userEmail:email}
            const user = await userCollection.find(query).toArray()
            res.send(user)
        })

        app.post('/users',async(req,res)=>{
            const userData = req.body
            console.log(userData)
            const result = await userCollection.insertOne(userData)
            res.send(result)

        })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From TopGear Perform');
})

app.listen(port, () => {
    console.log(`TopGear Perform app listening on port ${port}`);
})