// Import the 'express' library to create a new router.
const express = require('express')

// Create a new router instance.
const router = express.Router()

// Import the 'authController' module to handle authentication-related routes and logic.
const authController = require('../controllers/authController')

// Import the 'loginLimiter' middleware to limit login attempts.
const loginLimiter = require('../middleware/loginLimiter')

// Define a route for the root URL ('/') using the POST method.
router.route('/')
    .post(loginLimiter, authController.login)

// Define a route for the '/refresh' URL using the GET method, used for token refreshing.
router.route('/refresh')
    .get(authController.refresh)

// Define a route for the '/logout' URL using the POST method, used for logging out.
router.route('/logout')
    .post(authController.logout)

// Export the 'router' object to make it available for use in other parts of the application.
module.exports = router
