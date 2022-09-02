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
        const chatuserCollection = client.db('top_gear_perform').collection('chatuser');
        // coures
        const courseCollection = client.db('top_gear_perform').collection('course');

        // course
        app.get('/course', async (req, res) => {
            // res.send('hello i am ready')
            const query = {};
            const course = courseCollection.find(query);
            const item = await course.toArray();
            res.send(item);


        })

        // course post 
        app.post('/course', async (req, res) => {
            const course = req.body;
            const result = await courseCollection.insertOne(course);
            res.send(result);
        })

        // course delete
        app.delete('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await courseCollection.deleteOne(query);
            res.send(result);

        })
        const vacationCollection = client.db('top_gear_perform').collection('vacation');
        const vacationStoreCollection = client.db('top_gear_perform').collection('vacationStore');
        const userGoalCollection = client.db('top_gear_perform').collection('userGoal');

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



        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
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
        const countryCollection = client.db('All-Country').collection('Countries');

        app.get('/country', async (req, res) => {
            const query = {};
            const cursor = countryCollection.find(query);
            const country = await cursor.toArray();
            res.send(country)
        });
        app.get('/scheduleUser', async (req, res) => {
            const query = {};
            const cursor = scheduleUserDataCollection.find(query);
            const scheduleUser = await cursor.toArray();
            res.send(scheduleUser)
        });
        app.delete('/scheduleUser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await scheduleUserDataCollection.deleteOne(query);
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
        app.get('/notes/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const notes = await notesCollection.find(query).toArray();
            res.send(notes);
        });
        app.get('/notes', async (req, res) => {
            const notes = await notesCollection.find().toArray();
            res.send(notes);
        });

        // ========= vacation api ====================
        app.get('/vacation/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const dayOff = await vacationCollection.find(query).toArray();
            res.send(dayOff)
        });

        app.post('/vacation', async (req, res) => {
            const newVacation = req.body;
            const result = await vacationCollection.insertMany(newVacation);
            res.send(result);
        })

        app.get('/namevacation', async (req, res) => {
            const type = req.query.type;
            const email = req.query.email;
            const query = { name: type, email: email };
            const vacation = await vacationCollection.findOne(query);
            res.send(vacation);
        })

        app.put('/vacation/:name', async (req, res) => {
            const name = req.params.name;
            const update = req.body;
            const fillter = { name: name, email: update.email };
            const options = { upsert: true };
            const updatedoc = {
                $set: {
                    day: update.count
                }
            };
            const result = await vacationCollection.updateOne(fillter, updatedoc, options);
            res.send(result)
        });
        app.post('/vacationstore', async (req, res) => {
            const newVacation = req.body;
            const result = await vacationStoreCollection.insertOne(newVacation);
            res.send(result)
        });

        app.get('/vacationstore', async (req, res) => {
            const vacationAll = await vacationStoreCollection.find().toArray();
            res.send(vacationAll);
        });

        app.put('/vacationstore/feedback/:id', async (req, res) => {
            const id = req.params.id;
            const feedbackText = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { feedback: feedbackText.text },
            };
            const result = await vacationStoreCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.get('/vacationstore/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const vacationStore = await vacationStoreCollection.find(query).toArray();
            res.send(vacationStore);
        });

        // =============== add goal in dashboard =====================
        app.post('/usergoal', async (req, res) => {
            const newGoal = req.body;
            const result = await userGoalCollection.insertOne(newGoal);
            res.send(result);
        });
        app.get('/usergoal', async (req, res) => {
            const userGoal = await userGoalCollection.find().toArray();
            res.send(userGoal);
        });
        app.put('/usergoal/feedback/:id', async (req, res) => {
            const id = req.params.id;
            const feedbackText = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { feedback: feedbackText.text },
            };
            const result = await userGoalCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        app.get('/usergoal/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user: email };
            const result = await userGoalCollection.find(query).toArray();
            res.send(result);
        })
        app.delete('/goal/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userGoalCollection.deleteOne(query);
            res.send(result);
        });
        // verify admin 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ userEmail: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        });

        //verify manager
        app.get('/manager/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ userEmail: email });
            const isManager = user.role === 'manager';
            res.send({ manager: isManager });
        });
        // make manager
        app.put('/user/manager/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { role: 'manager' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.post('/chatuser', async (req, res) => {
            const newChat = req.body;
            const result = await chatuserCollection.insertOne(newChat);
            res.send(result);
        });
        app.get('/chatuser', async (req, res) => {
            const chats = await chatuserCollection.find().toArray();
            res.send(chats)
        });
        app.delete('/chatuser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await chatuserCollection.deleteOne(query);
            res.send(result);
        });

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
        });



        // course
        app.get('/course', async (req, res) => {
            // res.send('hello i am ready')
            const query = {};
            const course = courseCollection.find(query);
            const item = await course.toArray();
            res.send(item);


        })

        // course post 
        app.post('/course', async (req, res) => {
            const course = req.body;
            const result = await courseCollection.insertOne(course);
            res.send(result);
        })

        // course delete
        app.delete('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await courseCollection.deleteOne(query);
            res.send(result);

        })

        // Sumaya's code

        const emergencyCollection = client.db('emergency-contact').collection('emgcontact');
        app.get('/emgcontact', async (req, res) => {
            const query = {};
            const emgcontact = await emergencyCollection.find(query).toArray();
            res.send(emgcontact);
        });
        // post emgcontact 
        app.post('/emgcontact', async (req, res) => {
            const emgcontact = req.body;
            const result = await emergencyCollection.insertOne(emgcontact);
            res.send(result);
        })
        //  delete emgcontact
        app.delete('/emgcontact/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await emergencyCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ userEmail: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        });



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