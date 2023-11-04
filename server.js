require('dotenv').config();     // Import the 'dotenv', node.js module

const express = require('express')  // Import the Express.js library
const app = express()               // Create an instance of Express application
const path = require('path')        // Import the 'path' module for working with file and directory paths

const mongoose = require('mongoose')            // Import the mongoose library at the beginning of your file.
const connectDB = require('./config/dbConn')    // Import the connectDB function from the 'dbConn.js' module

const { logger, logEvents } = require('./middleware/logger')    // Import the 'logEvents' and 'logger' function from the './middleware/logger' module
const cookieParser = require('cookie-parser')                   // Import the 'cookieParser' middleware from the 'cookie-parser' library
const cors = require('cors')                                    // Import the 'cors' middleware from the 'cors' library
const corsOptions = require('./config/corsOptions')             // Import the 'corsOptions' middleware from the 'cors' library
const errorHandler = require('./middleware/errorHandler')       //Import the 'errorHandler' function from the './middleware/errorHandler' module

const PORT = process.env.PORT || 3500   // Define a PORT variable using an environment variable

connectDB()                 // call connectDB function

app.use(logger)             // Use the 'logger' middleware function for logging incoming requests and responses
app.use(cors(corsOptions))  // Use the 'cors' middleware function to enable Cross-Origin Resource Sharing (CORS)
app.use(cookieParser())     // Use the 'cookieParser' middleware function to parse incoming cookies in requests

app.use(express.json())     // This middleware allows your Express application to explain JSON data in incoming requests

app.use('/', express.static(path.join(__dirname, 'public')))    // This middleware serves static files from the 'public' directory.It makes files in the 'public' directory accessible to clients.
app.use('/', require('./routes/root'))                          // This middleware requires and uses the 'root' route defined in './routes/root'.It handles incoming requests to the root URL ('/') by delegating to the 'root' route.
app.use('/auth', require('./routes/authRoutes'))                // This middleware requires and uses the 'authRoutes' route defined in './auth/userRoutes'.It handles incoming requests to the root URL ('/auth') by delegating to the 'authRoutes' route.
app.use('/users', require('./routes/userRoutes'))               // This middleware requires and uses the 'userRoutes' route defined in './routes/userRoutes'.It handles incoming requests to the root URL ('/users') by delegating to the 'userRoutes' route.
app.use('/notes', require('./routes/noteRoutes'))               // This middleware requires and uses the 'noteRoutes' route defined in './routes/noteRoutes'.It handles incoming requests to the root URL ('/notes') by delegating to the 'noteRoutes' route.

app.all('*', (req, res) => { // Define a route handler for all HTTP methods and any URL path

    res.status(404) // Set the HTTP response status code to 404 (Not Found)

    // Check if the client accepts HTML responses
    if (req.accepts('html')) {
        // If accepted, send an HTML response by serving the '404.html' file
        res.sendFile(path.join(__dirname, 'view', '404.html'))
    } 
    // Check if the client accepts JSON responses
    else if (req.accepts('json')) {
        // If accepted, send a JSON response with a '404 Not Found' message
        res.json({ message: '404 Not Found' })
    } 
    // If the client doesn't accept HTML or JSON
    else {
        // Set the content type header to plain text
        res.type('txt')
        // Send a plain text response with '404 Not Found' message
        res.send('404 Not Found')
    }
})

app.use(errorHandler) // Use the 'errorHandler' middleware function for Express application logs

// This code establishes listeners for the MongoDB connection events and starts the Express server
// when the connection is successfully opened or handles errors when the connection encounters issues.

// Listener for 'open' event: This event is emitted when the MongoDB connection is successfully established.
mongoose.connection.once('open', () => {
    
    console.log('Connected to MongoDB')
    
    // Once the connection is open, start the Express server and log a message indicating the server is running.
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

// Listener for 'error' event: This event is emitted when there is an error in the MongoDB connection.
mongoose.connection.on('error', err => {
    console.log(err)

    // Log error details, including error number, error code, system call, and hostname, to a file named 'mongoErrLog.log'.
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

// app.listen(PORT, function() { console.log(`Server running on port ${PORT}`)}); Same output with regular function insteed of arrow function