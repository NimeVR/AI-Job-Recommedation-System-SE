const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Init Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ extended: false })); // Allows us to accept JSON data in the body

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));


app.get('/', (req, res) => res.send('Node.js API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));