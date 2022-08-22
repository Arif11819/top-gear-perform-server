const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gflsp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();


        const userCollection = client.db('top_gear_perform').collection('users')
        const taskCollection = client.db('top_gear_perform').collection('tasks');
     
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { userEmail: email }
            const user = await userCollection.find(query).toArray()
            res.send(user)
        })

        app.post('/users', async (req, res) => {
            const userData = req.body
            const result = await userCollection.insertOne(userData)
            res.send(result)

        })
        app.get('/task', async (req, res) => {
            const query = {};
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks)
        });
        app.post('/task', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);

        });

        app.get('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tasks = await taskCollection.findOne(query);
            res.send(tasks);
        });
        const progressCollection = client.db('top_gear_perform').collection('progress-task');
        app.get('/progress', async (req, res) => {
            const query = {};
            const cursor = progressCollection.find(query);
            const progress = await cursor.toArray();
            res.send(progress)
        });
        app.post('/progress', async (req, res) => {
            const task = req.body;
            const result = await progressCollection.insertOne(task);
            res.send(result);

        });

        app.get('/progress/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const progress = await progressCollection.findOne(query);
            res.send(progress);
        });
        const completeCollection = client.db('top_gear_perform').collection('completed-tasks');
        app.get('/complete', async (req, res) => {
            const query = {};
            const cursor = completeCollection.find(query);
            const complete = await cursor.toArray();
            res.send(complete)
        });
        app.post('/complete', async (req, res) => {
            const complete = req.body;
            const result = await completeCollection.insertOne(complete);
            res.send(result);

        });

        app.get('/complete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const complete = await completeCollection.findOne(query);
            res.send(complete);
        });
        const scheduleCollection = client.db('top_gear_perform').collection('scheduled-task');
        app.get('/schedule', async (req, res) => {
            const query = {};
            const cursor = scheduleCollection.find(query);
            const schedule = await cursor.toArray();
            res.send(schedule)
        });
        app.post('/schedule', async (req, res) => {
            const schedule = req.body;
            const result = await scheduleCollection.insertOne(schedule);
            res.send(result);

        });

        app.get('/schedule/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const schedule = await scheduleCollection.findOne(query);
            res.send(schedule);
        });


        console.log('Database connected');

        const reviewsCollection = client.db('top_gear_perform').collection('reviews');
        //  const scheduleCollection = client.db("UserData").collection('scheduleData');

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);

            app.get('/reviews/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const reviews = await reviewsCollection.findOne(query);
                res.send(reviews);
            });
        });


        //post schedule data
        app.post('/scheduleData', async (req, res) => {
            const newScheduleData = req.body;
            const result = await scheduleCollection.insertOne(newScheduleData);
            res.send(result);
        })

        // get all news
        const newsCollection = client.db('top_gear_perform').collection('news');
        app.get('/news', async (req, res) => {
            const query = {};
            const news = await newsCollection.find(query).toArray();
            res.send(news);
        });
        // post news 
        app.post('/postNews',async(req,res)=>{
            const news = req.body
            const result =await newsCollection.insertOne(news)
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