const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import route files
const authRoutes = require('./routes/authRoutes.js');
const vendorRoutes = require('./routes/vendorRoutes.js'); // 1. Import the new vendor routes
const bookingRoutes = require('./routes/bookingRoutes.js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes); // 2. Tell the server to use the vendor routes
app.use('/api/bookings', bookingRoutes);

// A simple test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('RecyGlo API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

