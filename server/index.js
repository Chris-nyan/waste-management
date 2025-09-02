const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes.js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);

// A simple test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('RecyGlo API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

