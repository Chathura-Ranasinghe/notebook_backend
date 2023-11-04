// Import required modules and dependencies
const User = require('../models/User')        // Import the User model
const Note = require('../models/Note')        // Import the Note model
const asyncHandler = require('express-async-handler') // Import a middleware for handling async errors
const bcrypt = require('bcrypt')               // Import the bcrypt library for password hashing

// @desc Get all users
// @route GET /users
// @access Private

// Define a function to get all users
const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB and exclude the 'password' field
    const users = await User.find().select('-password').lean()

    // If there are no users found
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    // Respond with the list of users
    res.json(users)
})

// Define a function to create a new user
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body // Extract username, password, and roles from the request body

    // Confirm that all required fields are present
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if there is a duplicate username in the database
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash the user's password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    // Create an object representing the new user
    const userObject = { username, "password": hashedPwd, roles }

    // Create and store the new user in the database
    const user = await User.create(userObject)

    if (user) {
        // If the user is created successfully, respond with a success message
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        // If there's an issue creating the user, respond with an error message
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// Define a function to update a user
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body // Extract user data from the request body

    // Confirm that all required fields (except password) are present
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Find the user in the database by ID
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for a duplicate username in the database (excluding the current user)
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Update the user's properties
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // If a new password is provided, hash and update it
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    // Save the updated user object in the database
    const updatedUser = await user.save()

    // Respond with a success message
    res.json({ message: `${updatedUser.username} updated` })
})

// Define a function to delete a user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body // Extract the user ID from the request body

    // Confirm that the user ID is provided
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Check if the user has assigned notes
    const note = await Note.findOne({ user: id }).lean().exec()

    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Find the user by ID in the database
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Delete the user from the database
    const result = await user.deleteOne()

    // Respond with a message indicating the deleted user's information
    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

// Export the defined functions for use in other parts of the application
module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}