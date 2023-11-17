// ---------------------User data model-------------------------

// Import the mongoose library at the beginning of your file.
const mongoose = require('mongoose');

// Define a user schema using Mongoose.
const userSchema = new mongoose.Schema({
    // Username field, which is a required string.
    username: {
        type: String,
        required: true,
    },
    // Password field, also required for user authentication.
    password: {
        type: String,
        required: true,
    },
    // Roles field, an array of strings with a default value of "Employee."
    roles: {
        type: [String],
        default: ["Employee"]
    },
    // Active field, a boolean flag to indicate whether the user is active or not.
    active: {
        type: Boolean,
        default: true

    }
})

// Create and export a mongoose model named 'User' based on the user schema.
module.exports = mongoose.model('User', userSchema);