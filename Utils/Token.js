// generateToken.js
require('dotenv').config()
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  // Generate a JWT token with the user ID
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '5d' });
};





const generateTokenForOrganizer = (organiserId) => {
  // Generate a JWT token with the user ID
  return jwt.sign({ organiserId }, process.env.JWT_SECRET_KEY_ORG, { expiresIn: '5d' });
};

module.exports = generateToken;

module.exports = {generateToken , generateTokenForOrganizer};
