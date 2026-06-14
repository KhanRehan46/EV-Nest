import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Charger from '../models/Charger.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretchargelinkjwtkey98765', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user/merchant
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, carModel, batteryCapacityKwh } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      carModel: carModel || '',
      batteryCapacityKwh: batteryCapacityKwh || 0,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        carModel: user.carModel,
        batteryCapacityKwh: user.batteryCapacityKwh,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        carModel: user.carModel,
        batteryCapacityKwh: user.batteryCapacityKwh,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Demo login — no password needed, login by role
// @route   POST /api/auth/demo-login
// @access  Public
router.post('/demo-login', async (req, res) => {
  const { role } = req.body; // 'user' or 'merchant'

  try {
    const demoEmail = role === 'merchant' ? 'host@evnest.com' : 'user@evnest.com';
    const user = await User.findOne({ email: demoEmail });

    if (!user) {
      return res.status(404).json({ message: 'Demo account not found. Please restart the server.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      carModel: user.carModel || '',
      batteryCapacityKwh: user.batteryCapacityKwh || 0,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        carModel: user.carModel,
        batteryCapacityKwh: user.batteryCapacityKwh,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile (e.g. carModel, battery capacity)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.carModel = req.body.carModel !== undefined ? req.body.carModel : user.carModel;
      user.batteryCapacityKwh = req.body.batteryCapacityKwh !== undefined ? req.body.batteryCapacityKwh : user.batteryCapacityKwh;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        carModel: updatedUser.carModel,
        batteryCapacityKwh: updatedUser.batteryCapacityKwh,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset and re-seed the demo database
// @route   POST /api/auth/reset-demo
// @access  Public
router.post('/reset-demo', async (req, res) => {
  try {
    if (global.useMockDb) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const DATA_DIR = path.join(__dirname, '..', 'data');
      const files = ['users.json', 'chargers.json', 'bookings.json', 'reviews.json'];
      
      files.forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      // Force reload models to regenerate default files in mock database
      await User.find({});
      await Charger.find({});
      await Booking.find({});
      await Review.find({});
      
      return res.json({ message: 'Demo database reset successfully (JSON Fallback Mode)' });
    } else {
      // MongoDB Connection Mode
      await User.deleteMany({});
      await Charger.deleteMany({});
      await Booking.deleteMany({});
      await Review.deleteMany({});
      
      // Re-seed default users
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const hostUser = await User.create({
        _id: '666a2b3c4d5e6f7a8b9c0d01',
        name: 'Rajesh Sharma (Host)',
        email: 'host@evnest.com',
        password: hashedPassword,
        role: 'merchant',
        carModel: '',
        batteryCapacityKwh: 0,
      });
      
      const driverUser = await User.create({
        _id: '666a2b3c4d5e6f7a8b9c0d02',
        name: 'Amit Patel (Driver)',
        email: 'user@evnest.com',
        password: hashedPassword,
        role: 'user',
        carModel: 'Tata Nexon EV Max',
        batteryCapacityKwh: 40.5,
      });
      
      const chargers = [
        {
          _id: '666c00000000000000000001',
          merchantId: hostUser._id,
          title: 'Surat Ring Road Fast DC',
          description: 'High speed CCS dual-gun charger in hotel parking lot. 24/7 access with lounge and food nearby.',
          address: 'Ring Rd, near Sahara Darwaja, Surat, Gujarat 395002',
          lat: 21.1895,
          lng: 72.8398,
          connectorType: 'CCS',
          speedKw: 50,
          pricePerKwh: 18.50,
          markupPercent: 35,
          photos: [
            'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1620223321526-7243c332fe41?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000002',
          merchantId: hostUser._id,
          title: 'Ahmedabad SG Highway EV Hub',
          description: 'Rapid 120kW charging station inside Dev Arc Mall. Enjoy shopping while your vehicle charges.',
          address: 'Sarkhej - Gandhinagar Hwy, near ISKCON Cross Road, Ahmedabad, Gujarat 380015',
          lat: 23.0245,
          lng: 72.5074,
          connectorType: 'CCS',
          speedKw: 120,
          pricePerKwh: 22.00,
          markupPercent: 50,
          photos: [
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000003',
          merchantId: hostUser._id,
          title: 'Vadodara Alkapuri AC Charger',
          description: 'Convenient AC charging station ideal for office goers. Secure parking inside commercial complex.',
          address: 'Alkapuri Rd, opposite Alkapuri Club, Vadodara, Gujarat 390007',
          lat: 22.3112,
          lng: 73.1695,
          connectorType: 'Type2',
          speedKw: 7.4,
          pricePerKwh: 12.00,
          markupPercent: 35,
          photos: [
            'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000004',
          merchantId: hostUser._id,
          title: 'Mumbai Bandra West Premium AC/DC',
          description: 'Premium dual-connector (CCS & Type2) charger in secure residential society garage. Safe and clean.',
          address: 'Carter Rd, Bandra West, Mumbai, Maharashtra 400050',
          lat: 19.0600,
          lng: 72.8230,
          connectorType: 'CCS',
          speedKw: 60,
          pricePerKwh: 24.50,
          markupPercent: 50,
          photos: [
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000005',
          merchantId: hostUser._id,
          title: 'Pune Koregaon Park Smart AC',
          description: 'Quiet AC charger located in a private bungalow driveway. Safe for overnight or afternoon charging.',
          address: 'Lane 5, Koregaon Park, Pune, Maharashtra 411001',
          lat: 18.5392,
          lng: 73.8925,
          connectorType: 'Type2',
          speedKw: 7.4,
          pricePerKwh: 13.50,
          markupPercent: 35,
          photos: [
            'https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000006',
          merchantId: hostUser._id,
          title: 'Gandhinagar Sector 11 Bharat AC',
          description: 'Affordable low speed charger for daily commuters. Situated close to government offices.',
          address: 'Sector 11, Gandhinagar, Gujarat 382011',
          lat: 23.2201,
          lng: 72.6420,
          connectorType: 'Bharat AC',
          speedKw: 3.3,
          pricePerKwh: 8.50,
          markupPercent: 20,
          photos: [
            'https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000007',
          merchantId: hostUser._id,
          title: 'Lonavala Highway Pitstop Charger',
          description: 'Rapid charging stop for travelers heading to Pune/Mumbai. Located in Sunny Da Dhaba parking.',
          address: 'Mumbai-Pune Expressway, Lonavala, Maharashtra 410401',
          lat: 18.7610,
          lng: 73.4350,
          connectorType: 'CCS',
          speedKw: 50,
          pricePerKwh: 19.00,
          markupPercent: 50,
          photos: [
            'https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
        {
          _id: '666c00000000000000000008',
          merchantId: hostUser._id,
          title: 'Navsari AC Eco Station',
          description: 'Slow AC charger on the highway. Secure private house front-yard. Toilet and water available.',
          address: 'National Highway 48, near Navsari, Gujarat 396445',
          lat: 20.9592,
          lng: 72.9430,
          connectorType: 'Type2',
          speedKw: 7.4,
          pricePerKwh: 11.00,
          markupPercent: 35,
          photos: [
            'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
          ],
          isLive: true,
        },
      ];
      
      await Charger.insertMany(chargers);
      
      await Review.create({
        userId: driverUser._id,
        chargerId: '666c00000000000000000001',
        rating: 5,
        comment: 'Super fast charging and clean waiting area! The host Rajesh was very friendly and offered water.',
      });
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      await Booking.create({
        userId: driverUser._id,
        chargerId: '666c00000000000000000001',
        scheduledAt: yesterday,
        durationMinutes: 60,
        estimatedCost: 35.5 * 1.35,
        status: 'completed',
        paymentId: 'pay_mock_12345',
      });
      
      return res.json({ message: 'Demo database reset successfully (MongoDB Connected Mode)' });
    }
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ message: 'Error resetting database: ' + error.message });
  }
});

export default router;
