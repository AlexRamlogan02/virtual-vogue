const express = require('express');
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

require("dotenv").config();

const path = require("path");
const PORT = process.env.PORT || 5002;
//app.set('port', (process.env.PORT || 5002));

// Connect to MongoDB
const { MongoClient } = require("mongodb");
const url = process.env.ATLAS_URI;
console.log(url);
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect(console.log("mongodb connected"));
const db = client.db("VirtualCloset");

// Run Server
app.listen(PORT, () =>
{
    console.log(`Server is running on port: ${PORT}`);
});

// Headers
app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

// Login API Endpoint
app.post('/api/Login', async (req, res, next) =>
{
    // incoming: login, password
    // outgoing: userId (_id), firstName, lastName, email, verified (isVerified), error

    var error = '';
    var id = -1;
    var fn = '';
    var ln = '';
    var em = '';
    var vr = false;

    try {
        const { login, password } = req.body;
        const results = await
        db.collection('Users').find({Login:login,Password:password}).toArray();
    
        if( results.length > 0 )
        {
            id = results[0]._id;
            fn = results[0].FirstName;
            ln = results[0].LastName;
            em = results[0].Email;
            vr = results[0].isVerified;
        }
    }
    catch(e)
    {
        error = e.toString();
    }

    var ret = { userId:id, firstName:fn, lastName:ln, email:em, verified:vr, error:error };
    res.status(200).json(ret);
});

// Register API Endpoint
app.post('/api/Register', async (req, res, next) =>
{
    // incoming: login, password, firstName, lastName, email
    // outgoing: userId, error

    const { login, password, firstName, lastName, email } = req.body;

    const newUser = {Login:login,Password:password,FirstName:firstName,LastName:lastName,Email:email,isVerified:false};
    var error = '';
    var id = -1;

    try
    {
        const results = db.collection('Users').insertOne(newUser);
    }
    catch(e)
    {
        error = e.toString();
    }

    var ret = { error: error };
    res.status(200).json(ret);
});

// Heroku Deployment
if (process.env.NODE_ENV === 'production')
{
    // Set static folder
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) =>
    {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}