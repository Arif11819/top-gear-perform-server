const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId, Timestamp } = require('mongodb');
require('dotenv').config();
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gflsp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// ============== verifyJWT ======================
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorize access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next()
    });
}


//================ Email sender schedule =========
const mailSenderOption = {
    auth: {
        api_key: process.env.EMAIL_SENDER_KEY
    }
}

const emailClient = nodemailer.createTransport(sgTransport(mailSenderOption));

function scheduleSendEmail(newScheduleData) {
    const { email, userName, date, time, company } = newScheduleData;
    var emailSend = {
        from: process.env.EMAIL_SEND,
        to: email,
        subject: `Your schedule for ${company} is on ${date} at ${time} is confirmed`,
        text: `Your schedule for ${company} is on ${date} at ${time} is confirmed`,
        html: `
            <div>
                <p>Hello ${userName},</p>
                <p>Thank you for requesting a product demonstration of TopGearPerform</p>
                <p>Badhon Chaki, one of our product experts, will be reaching out shortly to show you how TopGearPerform can streamline and formalize your performance management process.</p>
                <h3>Your schedule for ${company} is confirmed</h3>
                <p>Looking forword to meeting you on ${date} at ${time}</p>
                <p>Your meeting link ${process.env.MEET_LINK}</p>
                <p>You can choose the day and time that works best for you.</p>
                <p>Talk with you soon,</p>

                <h4>Team TopGearPerform</h4>
                <p>+8801818392344</p>

                <a href="https://topgearperform.netlify.app/">TopGearPerform</a>

                <span>---------</span>
                <p>TopGearPerform,Inc.</p>
                <p>Dhaka,Bangladesh</p>
            </div>
        `
    };

    emailClient.sendMail(emailSend, function (err, info) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Message sent: ', info.response);
        }
    });
}


async function run() {
    try {
        await client.connect();
        const userCollection = client.db('top_gear_perform').collection('users')
        const taskCollection = client.db('top_gear_perform').collection('tasks');
        const scheduleUserDataCollection = client.db('top_gear_perform').collection('scheduleUserData');
        const timeSlotsCollection = client.db('top_gear_perform').collection('timeSlots');
        const notesCollection = client.db('top_gear_perform').collection('notes');

        //AUTH 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        });

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

        });
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        });
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
        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
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
        app.delete('/progress/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await progressCollection.deleteOne(query);
            res.send(result);
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

        app.delete('/complete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await completeCollection.deleteOne(query);
            res.send(result);
        });
        const schemeCollection = client.db('top_gear_perform').collection('scheduled-task');

        app.get('/schedule', async (req, res) => {
            const query = {};
            const cursor = schemeCollection.find(query);
            const schedule = await cursor.toArray();
            res.send(schedule)
        });
        app.post('/schedule', async (req, res) => {
            const schedule = req.body;
            const result = await schemeCollection.insertOne(schedule);
            res.send(result);
        });
        app.get('/schedule/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const schedule = await schemeCollection.findOne(query);
            res.send(schedule);
        });
        app.delete('/schedule/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await schemeCollection.deleteOne(query);
            res.send(result);
        });
        const employeeCollection = client.db('Company-employee').collection('employees');
        app.get('/employee', async (req, res) => {
            const query = {};
            const cursor = employeeCollection.find(query);
            const employees = await cursor.toArray();
            res.send(employees);
        });
        app.get('/employee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const employees = await employeeCollection.findOne(query);
            res.send(employees);
        });
        app.post('/employee', async (req, res) => {
            const employees = req.body;
            const result = await employeeCollection.insertOne(employees);
            res.send(result);
        });

        app.delete('/employee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await employeeCollection.deleteOne(query);
            res.send(result);
        });

        const blogCollection = client.db('TopGear-Blogs').collection('Blogs');

        app.get('/blog', async (req, res) => {
            const query = {};
            const cursor = blogCollection.find(query);
            const blog = await cursor.toArray();
            res.send(blog)
        });
        app.post('/blog', async (req, res) => {
            const schedule = req.body;
            const result = await blogCollection.insertOne(schedule);
            res.send(result);
        });
        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogCollection.findOne(query);
            res.send(blog);
        });
        app.delete('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            res.send(result);
        });

        const ebookCollection = client.db('TopGear-ebooks').collection('E-books');

        app.get('/ebook', async (req, res) => {
            const query = {};
            const cursor = ebookCollection.find(query);
            const blog = await cursor.toArray();
            res.send(blog)
        });
        app.post('/ebook', async (req, res) => {
            const schedule = req.body;
            const result = await ebookCollection.insertOne(schedule);
            res.send(result);
        });
        app.get('/ebook/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const ebook = await ebookCollection.findOne(query);
            res.send(ebook);
        });
        app.delete('/ebook/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ebookCollection.deleteOne(query);
            res.send(result);
        });

        console.log('Database connected');

        const reviewsCollection = client.db('top_gear_perform').collection('reviews');
        //  const collectionss = client.db("UserData").collection('scheduleData');

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

        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.send(result);

        });

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        app.post('/employee', async (req, res) => {
            const employees = req.body;
            const result = await employeeCollection.insertOne(employees);
            res.send(result);

        });


        //============== Mazharul ===================
        //post schedule data
        app.post('/scheduleData', async (req, res) => {
            const newScheduleData = req.body;
            const query = { time: newScheduleData.time, email: newScheduleData.email, date: newScheduleData.date }
            const exist = await scheduleUserDataCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, newScheduleData: exist })
            }
            const result = await scheduleUserDataCollection.insertOne(newScheduleData);
            scheduleSendEmail(newScheduleData)
            return res.send({ success: true, result });
        });
        app.get('/timeSlots', async (req, res) => {
            const timeSlots = await timeSlotsCollection.find().toArray();
            res.send(timeSlots);
        });

        // ============= Notes api =================
        app.post('/notes', async (req, res) => {
            const newNote = req.body;
            const result = await notesCollection.insertOne(newNote);
            res.send(result);
        });
        app.get('/notes', async (req, res) => {
            const notes = await notesCollection.find().toArray();
            res.send(notes);
        });

        // app.get('/timeAvailable', async (req, res) => {
        //     const date = req.query.date || 'Aug 16, 2022'
        //     const timeSlots = await timeSlotsCollection.find().toArray();
        //     const query = { date: date }
        //     const bookings = await scheduleUserDataCollection.find(query).toArray();
        //     timeSlots.forEach(timeSlot => {
        //         const timeBooks = bookings.filter(b => b.time === timeSlot.time);
        //         const booked = timeBooks.map(t => t.time);
        //         const availableTime = timeSlots.filter(t => !booked.time(t))
        //         // timeSlot.time = availableTime;
        //         // timeSlot.booked = timeBooks.map(t => t.time)
        //         console.log(availableTime);
        //     })
        //     res.send(timeSlots)
        // })


        // get all news
        const newsCollection = client.db('top_gear_perform').collection('news');
        app.get('/news', async (req, res) => {
            const query = {};
            const news = await newsCollection.find(query).toArray();
            res.send(news);
        });
        // post news 
        app.post('/postNews', async (req, res) => {
            const news = req.body
            const result = await newsCollection.insertOne(news)
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