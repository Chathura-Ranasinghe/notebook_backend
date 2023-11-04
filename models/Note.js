// ---------------------Note data model-------------------------

// Import the mongoose library at the beginning of your file.
const mongoose = require('mongoose')

// Import the mongoose-sequenc plugin from mongoose library
const AutoIncrement = require('mongoose-sequence')(mongoose)

// Define the schema for the 'Note' model
const noteSchema = new mongoose.Schema(
    {
        // User reference field: Each note is associated with a user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' // References the 'User' model
        },
        // Title field. title of the note (required)
        title: {
            type: String,
            required: true
        },
        // Text field. content of the note (required)
        text: {
            type: String,
            required: true
        },
        // Completion field. status of the note (defaults to false)
        completed: {
            type: Boolean,
            default: false
        }
    },
    // {} encloses the options for the schema. In this specific case, it's used to enable the timestamps option.
    {
        // Enable timestamps: Automatically adds 'createdAt' and 'updatedAt' fields
        timestamps: true
    }
)

// Plugin for Auto-Incrementing 'ticket' field
noteSchema.plugin(AutoIncrement, {
    // Field to increment
    inc_field: 'ticket',
    // Identifier for this sequence
    id: 'ticketNums',
    // Starting sequence number
    start_seq: 500
})

// Export the 'Note' model using the defined schema
module.exports = mongoose.model('Note', noteSchema)
