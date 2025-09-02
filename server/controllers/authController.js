const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Controller for user registration
const register = async (req, res) => {
  // Destructure all possible fields, including the new 'district' field
  const { name, email, password, role, businessName, phone, street, district, city, zipCode, country, operatingHours } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Basic information (name, email, password, role) is required."
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    // If the role is VENDOR, validate and add the new detailed fields
    if (role === 'VENDOR') {
      if (!businessName || !phone || !street || !district || !city || !zipCode || !country || !operatingHours) {
        return res.status(400).json({
          message: "Business name, phone, full address (including district), and operating hours are required for vendors."
        });
      }

      // Use a nested write to create the VendorProfile with the structured address
      userData.vendorProfile = {
        create: {
          businessName,
          phone,
          street,
          district,
          city,
          zipCode,
          country,
          operatingHours,
        },
      };
    } else {
      // For regular USERS, create a simple UserProfile
      userData.userProfile = {
        create: {},
      };
    }

    // Create the new user and their profile in a single database transaction
    await prisma.user.create({
      data: userData,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Controller for user login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in the .env file.");
        return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login };

