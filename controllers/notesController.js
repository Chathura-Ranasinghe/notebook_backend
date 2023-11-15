// Import required modules and dependencies
const User = require('../models/User')        // Import the User model
const Note = require('../models/Note')        // Import the Note model
const asyncHandler = require('express-async-handler') // Import a middleware for handling async errors

// Define a function to get all notes
const getAllNotes = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()

    // If there are no notes found
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // Add the username to each note before sending the response
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        // Find the user associated with the note
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username } // Include the username in the note data
    }))

    // Respond with the list of notes, each including the associated username
    res.json(notesWithUser)
})

// Define a function to create a new note
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body // Extract user, title, and text from the request body

    // Confirm that all required fields are present
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for a duplicate note title in the database
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    // Create and store the new note in the database
    const note = await Note.create({ user, title, text })

    if (note) { // If the note is created successfully, respond with a success message
        return res.status(201).json({ message: 'New note created' })
    } else {
        // If there's an issue creating the note, respond with an error message
        return res.status(400).json({ message: 'Invalid note data received' })
    }
})

// Define a function to update a note
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body // Extract note data from the request body

    // Confirm that all required fields are present
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Find the note in the database by ID
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for a duplicate note title in the database (excluding the current note)
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow renaming of the original note
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    // Update the note's properties
    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    // Save the updated note object in the database
    const updatedNote = await note.save()

    // Respond with a success message
    res.json(`'${updatedNote.title}' updated`)
})

// Define a function to delete a note
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body // Extract the note ID from the request body

    // Confirm that the note ID is provided
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Find the note by ID in the database
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Delete the note from the database
    const result = await note.deleteOne()

    // Respond with a message indicating the deleted note's information
    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

// Export the defined functions for use in other parts of the application
module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}