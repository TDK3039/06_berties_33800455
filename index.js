// Import express and ejs
var express = require ('express')
var ejs = require('ejs')
const path = require('path')

//new changes that i made
var mysql = require('mysql2');
//load env variables
require('dotenv').config();
console.log('Loaded DB_USER:', process.env.DB_USER);

//Express-session
var session = require('express-session');

//Import express-sanistiser
const expressSanitizer = require('express-sanitizer');

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

//Create the input for the sanitiser 
app.use(expressSanitizer());

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

//Session create
app.use(session({
    secret: 'somerandomstuff', //sign session ID cookie
    resave: false,             //nothing changed - do not save the session
    saveUninitialized: false,  // No empty sessions
    cookie: {                  
        expires: 600000        // session expires - 10 minutes
    }
}))

// Define our application-specific data
app.locals.shopData = {shopName: "Bertie's Books"}

// Define the database connection pool
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// Load the Weather route handler
const weatherRouter = require('./routes/weather')
app.use('/weather', weatherRouter)

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))