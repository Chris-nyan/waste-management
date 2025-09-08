const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import route files
const authRoutes = require('./routes/authRoutes.js');
const vendorRoutes = require('./routes/vendorRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes.js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// --- Middleware ---
// ✅ CORS fix
app.use(cors({
  origin: "http://localhost:5173",   // adjust to your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);

// A simple test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('RecyGlo API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});