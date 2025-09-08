// Simple mock auth middleware for development
const mockAuth = (req, res, next) => {
  // Add a mock user to the request for testing
  req.user = {
    id: 'test_user_123',
    email: 'test@example.com',
    name: 'Test User'
  };
  next();
};

module.exports = mockAuth;
