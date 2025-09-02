const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check if the token is in the Authorization header and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user payload to the request object (excluding the password)
      // This makes the user's info available in any subsequent protected route
      req.user = decoded;

      next(); // Proceed to the next middleware or the route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
