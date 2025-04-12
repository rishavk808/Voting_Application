const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL (ensure that process.env.MONGODB_URL_LOCAL is set in your .env file)
const mongoURL = process.env.MONGODB_URL_LOCAL;

// Connect to MongoDB using mongoose
// mongoose.connect(mongoURL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect('mongodb://localhost:27017/mydb');
// Assign the default connection to the variable 'db'
const db = mongoose.connection;

// Define event listeners for the database connection
db.on('connected', () => {
  console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Export the database connection for use in other parts of your application
module.exports = db;
