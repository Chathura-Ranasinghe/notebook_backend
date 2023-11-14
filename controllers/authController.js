// Import necessary modules and packages
const User = require('../models/User') // Import User model
const bcrypt = require('bcrypt') // Import bcrypt for password hashing
const jwt = require('jsonwebtoken') // Import JSON Web Token library
const asyncHandler = require('express-async-handler') // Import middleware for handling asynchronous functions in Express

// Define a function for handling user login
// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Find a user in the database with the provided username
    const foundUser = await User.findOne({ username }).exec()

    // If no user is found or the user is not active, return unauthorized
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    // Compare the provided password with the hashed password stored in the database
    const match = await bcrypt.compare(password, foundUser.password)

    // If passwords do not match, return unauthorized
    if (!match) return res.status(401).json({ message: 'Unauthorized' })

    // Generate an access token containing user information and roles
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    )

    // Generate a refresh token
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '20s' }
    )

    // Create a secure cookie with the refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // Accessible only by the web server
        secure: true, // Requires HTTPS
        sameSite: 'None', // Cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // Set cookie expiry to match refresh token expiration
    })

    // Send the access token in the response
    res.json({ accessToken })
})

// Define a function for refreshing access tokens
// @desc Refresh
// @route GET /auth/refresh
// @access Public - accessible because the access token has expired
const refresh = (req, res) => {
    // Retrieve cookies from the request
    const cookies = req.cookies

    // Check if the JWT cookie is present
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    // Extract the refresh token from the cookie
    const refreshToken = cookies.jwt

    // Verify the refresh token's validity
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            // If the verification fails, return forbidden
            if (err) return res.status(403).json({ message: 'Forbidden' })

            // Find the user associated with the decoded username
            const foundUser = await User.findOne({ username: decoded.username }).exec()

            // If no user is found, return unauthorized
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            // Generate a new access token with the user's information
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            // Send the new access token in the response
            res.json({ accessToken })
        })
    )
}

// Define a function for user logout
// @desc Logout
// @route POST /auth/logout
// @access Public - used to clear the cookie if it exists
const logout = (req, res) => {
    // Retrieve cookies from the request
    const cookies = req.cookies

    // Check if the JWT cookie is present
    if (!cookies?.jwt) return res.sendStatus(204) // No content

    // Clear the JWT cookie in the response
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    // Send a message indicating that the cookie has been cleared
    res.json({ message: 'Cookie cleared' })
}

// Export the login, refresh, and logout functions for use in other parts of the application
module.exports = {
    login,
    refresh,
    logout
}
