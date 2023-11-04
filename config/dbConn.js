//--------------------Create Connection------------------

// Import the mongoose library at the beginning of your file.
const mongoose = require('mongoose')

// Define a function to connect to the MongoDB database
const connectDB = async () => {
    try {
        // Attempt to establish a connection to the MongoDB database using the URI provided in the environment variables.
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.DATABASE_URI)
    } catch (err) {
        // If an error occurs during the connection attempt, log the error for debugging purposes.
        console.error('Error connecting to the database:', err)
    }
}

// Export the connectDB function to make it accessible to other parts of your application.
module.exports = connectDB