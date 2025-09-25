const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
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

// User Schema - Enhanced for the new features
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['member', 'specialist'], required: true },
  category: { type: String },
  specialization: { type: String },
  phone: { type: String },
  profilePhoto: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Appointment Schema - Enhanced for bulk creation and new features
const appointmentSchema = new mongoose.Schema({
  specialistId: { type: String, required: true },
  specialistName: { type: String, required: true },
  specialization: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String },
  phone: { type: String },
  memberName: { type: String, default: null },
  isBooked: { type: Boolean, default: false },
  bulkId: { type: String } // For grouping bulk-created appointments
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

// Update Profile
app.put('/api/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, profilePhoto } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    
    await user.save();
    
    console.log(`Profile updated for user: ${userId}`);
    
    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).send(`Profile update failed: ${error.message}`);
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

// Create single appointment (time slot)
app.post('/api/appointments', async (req, res) => {
  try {
    const { specialistId, specialistName, specialization, category, date, time, venue, phone, isBooked } = req.body;
    
    const appointment = new Appointment({
      specialistId,
      specialistName,
      specialization,
      category,
      date,
      time,
      venue,
      phone,
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

// Create bulk appointments with grouping
app.post('/api/appointments/bulk', async (req, res) => {
  try {
    const { appointments } = req.body;
    
    if (!appointments || !Array.isArray(appointments)) {
      return res.status(400).send('Invalid appointments data');
    }
    
    // Generate a unique bulk ID for this group
    const bulkId = uuidv4();
    
    // Add bulkId to all appointments
    const appointmentsWithBulkId = appointments.map(apt => ({
      ...apt,
      bulkId: bulkId
    }));
    
    const createdAppointments = await Appointment.insertMany(appointmentsWithBulkId);
    
    console.log(`Bulk created ${createdAppointments.length} appointments with bulkId: ${bulkId}`);
    res.json({ 
      appointments: createdAppointments,
      bulkId: bulkId,
      count: createdAppointments.length
    });
  } catch (error) {
    console.error('Error creating bulk appointments:', error);
    res.status(500).send(`Failed to create bulk appointments: ${error.message}`);
  }
});

// Get appointments by specialist
app.get('/api/appointments/specialist/:specialistId', async (req, res) => {
  try {
    const specialistId = req.params.specialistId;
    const appointments = await Appointment.find({ 
      specialistId: specialistId,
      isBooked: false 
    }).sort({ date: 1, time: 1 });
    
    console.log(`Retrieved ${appointments.length} appointments for specialist ${specialistId}`);
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching specialist appointments:', error);
    res.status(500).send(`Failed to fetch specialist appointments: ${error.message}`);
  }
});

// Get appointments by date
app.get('/api/appointments/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const category = req.query.category;
    
    let query = { 
      date: date,
      isBooked: false 
    };
    
    if (category) {
      query.category = category;
    }
    
    const appointments = await Appointment.find(query).sort({ time: 1 });
    
    console.log(`Retrieved ${appointments.length} appointments for date ${date}${category ? ` in category ${category}` : ''}`);
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching date appointments:', error);
    res.status(500).send(`Failed to fetch date appointments: ${error.message}`);
  }
});

// Search specialists
app.get('/api/search/specialists', async (req, res) => {
  try {
    const query = req.query.q;
    const category = req.query.category;
    
    let searchFilter = { userType: 'specialist' };
    
    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      searchFilter.category = category;
    }
    
    const specialists = await User.find(searchFilter).select('-password');
    
    console.log(`Found ${specialists.length} specialists for query: "${query || 'all'}"${category ? ` in category ${category}` : ''}`);
    res.json({ specialists });
  } catch (error) {
    console.error('Error searching specialists:', error);
    res.status(500).send(`Failed to search specialists: ${error.message}`);
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

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { venue, phone, time } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send('Appointment not found');
    }
    
    // Update appointment fields
    if (venue !== undefined) appointment.venue = venue;
    if (phone !== undefined) appointment.phone = phone;
    if (time !== undefined) appointment.time = time;
    
    await appointment.save();
    
    console.log(`Appointment updated: ${appointmentId}`);
    res.json({ appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).send(`Failed to update appointment: ${error.message}`);
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    if (!appointment) {
      return res.status(404).send('Appointment not found');
    }
    
    console.log(`Appointment deleted: ${appointmentId}`);
    res.json({ message: 'Appointment deleted successfully', appointment });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).send(`Failed to delete appointment: ${error.message}`);
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