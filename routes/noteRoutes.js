// Import the Express.js library
const express = require('express')

// Create a new instance of an Express router to define routes for this module
const router = express.Router()

// Import the notesController to handle note-related routes
const notesController = require('../controllers/notesController')

// Import the JWT verification middleware
const verifyJWT = require('../middleware/verifyJWT')

// Use the verifyJWT middleware for all routes defined under this router
router.use(verifyJWT)

// Define the routes for managing notes
router.route('/')
    // GET request to fetch all notes
    .get(notesController.getAllNotes)
    // POST request to create a new note
    .post(notesController.createNewNote)
    // PATCH request to update a note's information
    .patch(notesController.updateNote)
    // DELETE request to delete a note
    .delete(notesController.deleteNote);

// Export the router to be used in other parts of the application
module.exports = router;