const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['member', 'specialist'], required: true },
  category: { type: String },
  specialization: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  specialistId: { type: String, required: true },
  specialistName: { type: String, required: true },
  specialization: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  memberName: { type: String, default: null },
  isBooked: { type: Boolean, default: false }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, userType, category, specialization } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password, // In production, hash this with bcryptjs
      userType,
      category: userType === 'specialist' ? category : undefined,
      specialization: userType === 'specialist' ? specialization : undefined
    });
    
    await user.save();
    
    console.log(`User registered: ${email} (${userType})`);
    
    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(`Registration failed: ${error.message}`);
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).send('Invalid credentials');
    }
    
    console.log(`User logged in: ${email}`);
    
    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send(`Login failed: ${error.message}`);
  }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    console.log(`Retrieved ${appointments.length} appointments`);
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send(`Failed to fetch appointments: ${error.message}`);
  }
});

// Create appointment (time slot)
app.post('/api/appointments', async (req, res) => {
  try {
    const { specialistId, specialistName, specialization, category, date, time, isBooked } = req.body;
    
    const appointment = new Appointment({
      specialistId,
      specialistName,
      specialization,
      category,
      date,
      time,
      isBooked: isBooked || false
    });
    
    await appointment.save();
    
    console.log(`Appointment created: ${appointment._id} for ${specialistName} on ${date} at ${time}`);
    res.json({ appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send(`Failed to create appointment: ${error.message}`);
  }
});

// Book appointment
app.put('/api/appointments/:id/book', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { memberName } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send('Appointment not found');
    }
    
    if (appointment.isBooked) {
      return res.status(400).send('Appointment already booked');
    }
    
    // Update appointment
    appointment.memberName = memberName;
    appointment.isBooked = true;
    await appointment.save();
    
    console.log(`Appointment booked: ${appointmentId} by ${memberName}`);
    res.json({ appointment });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).send(`Failed to book appointment: ${error.message}`);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});