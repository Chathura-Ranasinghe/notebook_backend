// Import the JSON Web Token (JWT) library
const jwt = require('jsonwebtoken')

// Define middleware for verifying JSON Web Tokens (JWT)
const verifyJWT = (req, res, next) => {
    // Extract the JWT token from the request's "Authorization" or "authorization" header
    const authHeader = req.headers.authorization || req.headers.Authorization

    // Check if the header starts with "Bearer " indicating it's a Bearer Token
    if (!authHeader?.startsWith('Bearer ')) {
        // If not, return a 401 Unauthorized response
        return res.status(401).json({ message: 'Unauthorized' })
    }

    // Extract the token from the "Bearer" header by splitting it
    const token = authHeader.split(' ')[1]

    // Verify the token's validity using the provided access token secret
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            // If the verification fails, return a 403 Forbidden response
            if (err) return res.status(403).json({ message: 'Forbidden' })

            // If the token is valid, add the decoded user information to the request object
            req.user = decoded.UserInfo.username
            req.roles = decoded.UserInfo.roles

            // Move on to the next middleware or route handler
            next()
        }
    )
}

// Export the verifyJWT middleware for use in other parts of the application
module.exports = verifyJWT
