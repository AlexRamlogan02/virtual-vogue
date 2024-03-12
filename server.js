const express = require('express');
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path = require("path");
const PORT = process.env.PORT || 5001;

// Allow ".env" to be used
require("dotenv").config();

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
const ObjectId = require('mongodb').ObjectId;   // Get ObjectId type

// GridFS
// const methodOverride = require('method-override');
// const multer = require('multer');
// const GridFsStorage = require('multer-gridfs-storage');

// const storage = new GridFsStorage({
//     url: url,
//     file: (req, file) => {
//         return new Promise((resolve, reject) => {
//             crypto.randomBytes(16, (err, buf) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 const filename = buf.toString('hex') + path.extname(file.originalname);
//                 const fileInfo = {
//                     filename: filename,
//                     bucketName: 'uploads'
//                 };
//                 resolve(fileInfo);
//             });
//         });
//     }
// });

// const upload = mullter({ storage });

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

        if ( id == -1 ) {
            error = "User does not exist"
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

// Update Password API Endpoint
app.post('/api/UpdatePass', async (req, res, next) =>
{
    // incoming: userId, newPassword
    // outgoing: error

    const { userId, newPassword } = req.body;

    const filter = { _id: new ObjectId(userId) };
    const updateDoc = {
        $set: {
            Password: newPassword
        },
    };
    const options = { upsert: false }

    var error = '';

    try
    {
        const results = db.collection('Users').updateOne(filter, updateDoc, options);
    }
    catch(e)
    {
        error = e.toString();
    }

    var ret = { error: error };
    res.status(200).json(ret);
});

// Update isVerified API Endpoint
app.post('/api/UpdateVerification', async (req, res, next) =>
{
    // incoming: userId, verified
    // outgoing: error

    const { userId, verified } = req.body;

    const filter = { _id: new ObjectId(userId) };
    const updateDoc = {
        $set: {
            isVerified: verified
        },
    };
    const options = { upsert: false }

    var error = '';

    try
    {
        const results = db.collection('Users').updateOne(filter, updateDoc, options);
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
