// Import the Express.js library
const express = require('express')

// Create a new instance of an Express router to define routes for this module
const router = express.Router()

// Import the usersController to handle user-related routes
const usersController = require('../controllers/usersController')

// Import the JWT verification middleware
const verifyJWT = require('../middleware/verifyJWT')

// Use the verifyJWT middleware for all routes defined under this router
router.use(verifyJWT)

// Define the routes for managing users
router.route('/')
    // GET request to fetch all users
    .get(usersController.getAllUsers)
    // POST request to create a new user
    .post(usersController.createNewUser)
    // PATCH request to update a user's information
    .patch(usersController.updateUser)
    // DELETE request to delete a user
    .delete(usersController.deleteUser);

// Export the router to be used in other parts of the application
module.exports = router;