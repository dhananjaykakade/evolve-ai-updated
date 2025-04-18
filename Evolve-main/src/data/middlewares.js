// delayMiddleware.js (ES Module version)

export default (req, res, next) => {
  // Add a delay to simulate network latency
  setTimeout(() => {
    next();
  }, 300);
};
