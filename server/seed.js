import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Charger from './models/Charger.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chargelink');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Charger.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    console.log('Database cleared.');

    // Create password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create seed users
    const hostUser = await User.create({
      name: 'Rajesh Sharma (Host)',
      email: 'host@evnest.com',
      password: hashedPassword,
      role: 'merchant',
    });

    const driverUser = await User.create({
      name: 'Amit Patel (Driver)',
      email: 'user@evnest.com',
      password: hashedPassword,
      role: 'user',
      carModel: 'Tata Nexon EV Max',
      batteryCapacityKwh: 40.5,
    });

    console.log('Seed users created:');
    console.log(`- Merchant: ${hostUser.email} (password123)`);
    console.log(`- Driver: ${driverUser.email} (password123)`);

    // =========================================================================
    //  CHARGER SEED DATA — ALL INDIA (Local + Highway)
    //  ~50 chargers across North, South, East, West, Central & Northeast India
    // =========================================================================
    const chargers = [
      // ── WEST INDIA — Gujarat ──────────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Surat Ring Road Fast DC',
        description: 'High speed CCS dual-gun charger in hotel parking lot. 24/7 access with lounge and food nearby.',
        address: 'Ring Rd, near Sahara Darwaja, Surat, Gujarat 395002',
        lat: 21.1895, lng: 72.8398,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 18.50, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Ahmedabad SG Highway EV Hub',
        description: 'Rapid 120kW charging station inside Dev Arc Mall. Enjoy shopping while your vehicle charges.',
        address: 'Sarkhej - Gandhinagar Hwy, near ISKCON Cross Road, Ahmedabad, Gujarat 380015',
        lat: 23.0245, lng: 72.5074,
        connectorType: 'CCS', speedKw: 120, pricePerKwh: 22.00, markupPercent: 50,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Vadodara Alkapuri AC Charger',
        description: 'Convenient AC charging station ideal for office goers. Secure parking inside commercial complex.',
        address: 'Alkapuri Rd, opposite Alkapuri Club, Vadodara, Gujarat 390007',
        lat: 22.3112, lng: 73.1695,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Gandhinagar Sector 11 Bharat AC',
        description: 'Affordable low speed charger for daily commuters. Situated close to government offices.',
        address: 'Sector 11, Gandhinagar, Gujarat 382011',
        lat: 23.2201, lng: 72.6420,
        connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.50, markupPercent: 20,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Rajkot Kalawad Road Charger',
        description: 'DC fast charger near Rajkot city center. Located at a petrol pump with refreshments available.',
        address: 'Kalawad Rd, near Aji Dam, Rajkot, Gujarat 360005',
        lat: 22.2916, lng: 70.7636,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Navsari NH-48 Eco Station',
        description: 'Slow AC charger on the highway. Secure private house front-yard. Toilet and water available.',
        address: 'National Highway 48, near Navsari, Gujarat 396445',
        lat: 20.9592, lng: 72.9430,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── WEST INDIA — Maharashtra ──────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Mumbai Bandra West Premium DC',
        description: 'Premium CCS charger in secure residential society garage. Safe, clean, 24/7 access.',
        address: 'Carter Rd, Bandra West, Mumbai, Maharashtra 400050',
        lat: 19.0600, lng: 72.8230,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 24.50, markupPercent: 50,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Mumbai Andheri Local AC',
        description: 'Type2 charger in Andheri West near Metro station. Park and charge while commuting.',
        address: 'DN Nagar, Andheri West, Mumbai, Maharashtra 400053',
        lat: 19.1280, lng: 72.8360,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 14.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Pune Koregaon Park Smart AC',
        description: 'Quiet AC charger located in a private bungalow driveway. Safe for overnight or afternoon charging.',
        address: 'Lane 5, Koregaon Park, Pune, Maharashtra 411001',
        lat: 18.5392, lng: 73.8925,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.50, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Pune Hinjewadi IT Park DC',
        description: 'Fast 120kW charger inside IT park campus. Ideal for techies who need a quick top-up.',
        address: 'Phase 1, Hinjewadi, Pune, Maharashtra 411057',
        lat: 18.5912, lng: 73.7389,
        connectorType: 'CCS', speedKw: 120, pricePerKwh: 20.00, markupPercent: 45,
        photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Nagpur Sitabuldi Local AC',
        description: 'Centrally located Type2 charger in Nagpur city. Near main market and railway station.',
        address: 'Sitabuldi, Nagpur, Maharashtra 440012',
        lat: 21.1458, lng: 79.0882,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Nashik College Rd Charger',
        description: 'DC fast charger near Nashik wine country. Located at a restaurant with garden seating.',
        address: 'College Road, Nashik, Maharashtra 422005',
        lat: 19.9975, lng: 73.7898,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 17.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Mumbai-Pune Expressway ──────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Lonavala Highway Pitstop Charger',
        description: 'Rapid charging stop for travelers heading to Pune/Mumbai. Located at Sunny Da Dhaba parking.',
        address: 'Mumbai-Pune Expressway, Lonavala, Maharashtra 410401',
        lat: 18.7610, lng: 73.4350,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 19.00, markupPercent: 50,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Khalapur Expressway Charger',
        description: 'CCS fast charger at Khalapur toll plaza food court. Rest and recharge your EV.',
        address: 'Mumbai-Pune Expressway, Khalapur, Maharashtra 410202',
        lat: 18.8200, lng: 73.2800,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 20.00, markupPercent: 45,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── NORTH INDIA — Delhi NCR ───────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Delhi Connaught Place Fast DC',
        description: 'Premium 150kW DC fast charger in the heart of Delhi. Underground parking with 24/7 security.',
        address: 'Connaught Place, New Delhi, Delhi 110001',
        lat: 28.6315, lng: 77.2167,
        connectorType: 'CCS', speedKw: 150, pricePerKwh: 22.00, markupPercent: 50,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Delhi Dwarka Sector 21 AC',
        description: 'Residential society charger in Dwarka. Perfect for overnight charging near metro station.',
        address: 'Sector 21, Dwarka, New Delhi, Delhi 110077',
        lat: 28.5521, lng: 77.0581,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Gurgaon Cyber Hub DC Charger',
        description: '120kW fast charger at DLF Cyber Hub. Charge while you dine at premium restaurants.',
        address: 'DLF Cyber City, Gurugram, Haryana 122002',
        lat: 28.4949, lng: 77.0880,
        connectorType: 'CCS', speedKw: 120, pricePerKwh: 20.00, markupPercent: 45,
        photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Noida Sector 18 Market Charger',
        description: 'CHAdeMO charger at Atta Market parking. Great for shoppers and visitors.',
        address: 'Sector 18, Noida, Uttar Pradesh 201301',
        lat: 28.5690, lng: 77.3210,
        connectorType: 'CHAdeMO', speedKw: 50, pricePerKwh: 15.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── NORTH INDIA — Uttar Pradesh, Rajasthan, Punjab ────────────────────
      {
        merchantId: hostUser._id,
        title: 'Lucknow Hazratganj Local AC',
        description: 'Type2 AC charger in central Lucknow. Walking distance to Hazratganj market.',
        address: 'Hazratganj, Lucknow, Uttar Pradesh 226001',
        lat: 26.8530, lng: 80.9468,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 10.50, markupPercent: 25,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Jaipur MI Road Fast Charger',
        description: 'CCS fast charger on the main MI Road. Located at a heritage hotel with lounge access.',
        address: 'MI Road, Jaipur, Rajasthan 302001',
        lat: 26.9124, lng: 75.7873,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 18.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Chandigarh Sector 17 DC',
        description: 'High-speed DC charger in Chandigarh city center. Near the famous Sector 17 plaza.',
        address: 'Sector 17, Chandigarh 160017',
        lat: 30.7412, lng: 76.7838,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Amritsar Golden Temple Rd Charger',
        description: 'Local Bharat AC charger near the Golden Temple area. Affordable rates for pilgrims and tourists.',
        address: 'Golden Temple Rd, Amritsar, Punjab 143001',
        lat: 31.6200, lng: 74.8765,
        connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.00, markupPercent: 20,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Dehradun Rajpur Road Charger',
        description: 'Type2 charger at a cozy café on Rajpur Road. Charge your EV while enjoying mountain views.',
        address: 'Rajpur Road, Dehradun, Uttarakhand 248001',
        lat: 30.3565, lng: 78.0580,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Delhi-Jaipur Expressway (NH-48) ─────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Manesar NH-48 Highway Charger',
        description: 'Fast charger at Manesar industrial area on Delhi-Jaipur highway. Dhaba and restrooms nearby.',
        address: 'NH-48, Manesar, Haryana 122051',
        lat: 28.3590, lng: 76.9370,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 17.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Neemrana Fort Highway Stop',
        description: 'CCS charger at Neemrana Fort Palace parking. Heritage tourism meets EV charging.',
        address: 'NH-48, Neemrana, Rajasthan 301705',
        lat: 27.9860, lng: 76.3830,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 18.00, markupPercent: 45,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Delhi-Agra Yamuna Expressway ────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Mathura Yamuna Expressway Charger',
        description: 'DC fast charger at Yamuna Expressway rest area. On the way to Agra and Taj Mahal.',
        address: 'Yamuna Expressway, Mathura, UP 281001',
        lat: 27.4924, lng: 77.6737,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 16.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── SOUTH INDIA — Karnataka ───────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Bangalore Koramangala DC Hub',
        description: '150kW ultra-fast charger at a tech park in Koramangala. Multiple CCS connectors available.',
        address: '1st Block, Koramangala, Bangalore, Karnataka 560034',
        lat: 12.9352, lng: 77.6245,
        connectorType: 'CCS', speedKw: 150, pricePerKwh: 21.00, markupPercent: 50,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Bangalore Whitefield IT Charger',
        description: 'Fast DC charger inside ITPL tech park. Perfect for IT professionals during work hours.',
        address: 'ITPL Main Rd, Whitefield, Bangalore, Karnataka 560066',
        lat: 12.9698, lng: 77.7500,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 18.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Mysore Devaraja Market Charger',
        description: 'Local AC charger near famous Devaraja Market. Heritage area with plenty of attractions.',
        address: 'Dhanvanthri Rd, Mysore, Karnataka 570001',
        lat: 12.3051, lng: 76.6551,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── SOUTH INDIA — Tamil Nadu ──────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Chennai OMR Tech Corridor DC',
        description: 'Ultra-fast 150kW charger on Old Mahabalipuram Road. Serves the IT corridor commuters.',
        address: 'OMR, Sholinganallur, Chennai, Tamil Nadu 600119',
        lat: 12.9010, lng: 80.2279,
        connectorType: 'CCS', speedKw: 150, pricePerKwh: 20.00, markupPercent: 45,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Chennai T Nagar Local Charger',
        description: 'Type2 AC charger at Pondy Bazaar shopping area. Charge while shopping at T Nagar.',
        address: 'Pondy Bazaar, T Nagar, Chennai, Tamil Nadu 600017',
        lat: 13.0418, lng: 80.2341,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Coimbatore RS Puram Charger',
        description: 'Local CHAdeMO charger in Coimbatore city. Near RS Puram market with restrooms available.',
        address: 'RS Puram, Coimbatore, Tamil Nadu 641002',
        lat: 11.0043, lng: 76.9558,
        connectorType: 'CHAdeMO', speedKw: 50, pricePerKwh: 14.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Madurai Meenakshi Temple Charger',
        description: 'Bharat AC charger near the iconic Meenakshi Temple. Affordable rates for locals and tourists.',
        address: 'North Masi St, Madurai, Tamil Nadu 625001',
        lat: 9.9195, lng: 78.1193,
        connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.00, markupPercent: 20,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── SOUTH INDIA — Kerala & Telangana ──────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Kochi Marine Drive AC Charger',
        description: 'Scenic waterfront AC charger near Marine Drive promenade. Beautiful charging experience.',
        address: 'Marine Drive, Ernakulam, Kochi, Kerala 682031',
        lat: 9.9816, lng: 76.2757,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Trivandrum Technopark DC',
        description: 'Fast DC charger inside Technopark campus. Ideal for IT employees in Trivandrum.',
        address: 'Technopark, Trivandrum, Kerala 695581',
        lat: 8.5568, lng: 76.8816,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 17.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Hyderabad HITEC City Fast DC',
        description: '120kW fast charger in HITEC City IT hub. Multiple parking bays dedicated for EV charging.',
        address: 'HITEC City, Hyderabad, Telangana 500081',
        lat: 17.4435, lng: 78.3772,
        connectorType: 'CCS', speedKw: 120, pricePerKwh: 19.00, markupPercent: 45,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Hyderabad Charminar Local AC',
        description: 'Affordable AC charger in the old city near Charminar. Local area community charger.',
        address: 'Charminar, Hyderabad, Telangana 500002',
        lat: 17.3616, lng: 78.4747,
        connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 9.00, markupPercent: 25,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Bangalore-Chennai Expressway ────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Vellore NH-46 Highway Charger',
        description: 'CCS fast charger on NH-46 between Bangalore and Chennai. Dhaba with south Indian food.',
        address: 'NH-46, Vellore, Tamil Nadu 632001',
        lat: 12.9165, lng: 79.1325,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Hyderabad-Bangalore (NH-44) ─────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Anantapur NH-44 Highway Charger',
        description: 'Highway DC charger on India\'s longest national highway. Rest area with food court.',
        address: 'NH-44, Anantapur, Andhra Pradesh 515001',
        lat: 14.6819, lng: 77.6006,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 15.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── EAST INDIA — West Bengal, Odisha, Bihar ───────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Kolkata Salt Lake DC Charger',
        description: 'Fast 60kW DC charger in Salt Lake Sector V IT hub. Popular among tech commuters.',
        address: 'Sector V, Salt Lake, Kolkata, West Bengal 700091',
        lat: 22.5744, lng: 88.4344,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 16.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Kolkata Park Street Local AC',
        description: 'Type2 charger at Park Street heritage area. Charge while exploring Kolkata\'s nightlife.',
        address: 'Park Street, Kolkata, West Bengal 700016',
        lat: 22.5520, lng: 88.3508,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 25,
        photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Bhubaneswar Patia Local Charger',
        description: 'AC charger near KIIT University. Popular among students and local residents.',
        address: 'Patia, Bhubaneswar, Odisha 751024',
        lat: 20.3540, lng: 85.8190,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 10.00, markupPercent: 25,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Patna Boring Road Charger',
        description: 'CCS fast charger on Boring Road, Patna. Located at a mall parking lot with food court.',
        address: 'Boring Rd, Patna, Bihar 800001',
        lat: 25.6093, lng: 85.1376,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 14.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── CENTRAL INDIA — Madhya Pradesh, Chhattisgarh ──────────────────────
      {
        merchantId: hostUser._id,
        title: 'Bhopal New Market DC Charger',
        description: 'DC fast charger near New Market area. Close to Upper Lake with scenic surroundings.',
        address: 'New Market, Bhopal, Madhya Pradesh 462003',
        lat: 23.2332, lng: 77.4263,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 15.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Indore Vijay Nagar Local AC',
        description: 'Affordable Type2 charger in the cleanest city of India. Located near Treasure Island Mall.',
        address: 'Vijay Nagar, Indore, Madhya Pradesh 452010',
        lat: 22.7533, lng: 75.8937,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Raipur Telibandha Charger',
        description: 'Local DC charger near Telibandha Lake. Peaceful area with garden and walking trails.',
        address: 'Telibandha, Raipur, Chhattisgarh 492001',
        lat: 21.2415, lng: 81.6296,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 13.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — NH-44 (Delhi-Chennai Golden Quadrilateral) ──────────────
      {
        merchantId: hostUser._id,
        title: 'Nagpur Wardha Rd Highway Charger',
        description: 'Highway charger on Wardha Road connecting Nagpur to southern India. Truck stop with food.',
        address: 'Wardha Rd, NH-44, Nagpur, Maharashtra 440015',
        lat: 21.0918, lng: 79.1260,
        connectorType: 'CCS', speedKw: 60, pricePerKwh: 15.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── NORTHEAST INDIA ───────────────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Guwahati GS Road DC Charger',
        description: 'First fast charger in Guwahati city. Located on GS Road near Ganeshguri flyover.',
        address: 'GS Road, Ganeshguri, Guwahati, Assam 781006',
        lat: 26.1486, lng: 91.7745,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Shillong Police Bazaar AC',
        description: 'Community AC charger in the Scotland of the East. Located near the bustling Police Bazaar.',
        address: 'Police Bazaar, Shillong, Meghalaya 793001',
        lat: 25.5729, lng: 91.8787,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── GOA ───────────────────────────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Goa Panjim Beach Road Charger',
        description: 'Tourist-friendly charger near Miramar Beach. Perfect for rental EV tourists exploring Goa.',
        address: 'DB Marg, Panjim, Goa 403001',
        lat: 15.4989, lng: 73.8278,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 18.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Mumbai-Goa NH-66 ────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Ratnagiri NH-66 Highway Charger',
        description: 'Coastal highway charger between Mumbai and Goa. Located at a seafood restaurant parking.',
        address: 'NH-66, Ratnagiri, Maharashtra 415612',
        lat: 16.9944, lng: 73.3000,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 17.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── HIGHWAY — Ahmedabad-Udaipur NH-48 ─────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Udaipur Fateh Sagar Lake Charger',
        description: 'Scenic charger near Fateh Sagar Lake. A must-stop for tourists exploring the City of Lakes.',
        address: 'Fateh Sagar Rd, Udaipur, Rajasthan 313001',
        lat: 24.5926, lng: 73.6780,
        connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },

      // ── JAMMU & KASHMIR ───────────────────────────────────────────────────
      {
        merchantId: hostUser._id,
        title: 'Srinagar Dal Lake Road Charger',
        description: 'AC charger near the iconic Dal Lake. For tourists exploring Kashmir in electric vehicles.',
        address: 'Boulevard Road, Dal Lake, Srinagar, J&K 190001',
        lat: 34.0911, lng: 74.8560,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 14.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      
      // ── NEW LOCAL RESIDENTIAL CHARGERS (Airbnb-Style Peer-to-Peer) ────────
      {
        merchantId: hostUser._id,
        title: 'Adajan Home Garage Charger',
        description: 'Private residential garage charger in Adajan. Clean, safe parking slot with friendly host. Tea and water available.',
        address: 'A-102, Vasanji Nagar, near Star Bazar, Adajan, Surat, Gujarat 395009',
        lat: 21.1960, lng: 72.7950,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.50, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Vesu VIP Road Bungalow Port',
        description: 'Low-speed Bharat AC wallbox in private bungalow driveway. Accessible 24/7 with CCTV protection.',
        address: 'Bungalow 14, Royal Greens, VIP Road, Vesu, Surat, Gujarat 395007',
        lat: 21.1350, lng: 72.7720,
        connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.00, markupPercent: 20,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Juhu Beach Private Driveway',
        description: 'Type2 AC charger in Juhu beach residential driveway. Safe gated society with security guard. Walk on the beach while charging.',
        address: 'Plot 45, Juhu Tara Rd, near Juhu Beach, Mumbai, Maharashtra 400049',
        lat: 19.1020, lng: 72.8260,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 15.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Worli Seaface Residential Slot',
        description: 'Premium 11kW Type2 charger in high-rise society parking. Secure access with overnight charging allowed.',
        address: 'Block C, Sea Breeze Apartments, Worli Sea Face, Mumbai, Maharashtra 400030',
        lat: 19.0080, lng: 72.8150,
        connectorType: 'Type2', speedKw: 11, pricePerKwh: 18.00, markupPercent: 40,
        photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Chembur Society AC Charger',
        description: 'Community charger in a quiet Chembur neighborhood. Convenient location, close to Eastern Express Highway.',
        address: 'Central Avenue Rd, near Diamond Garden, Chembur, Mumbai, Maharashtra 400071',
        lat: 19.0620, lng: 72.8980,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Kothrud Bungalow Private Charger',
        description: 'Quiet private driveway charger in a green Kothrud lane. Safe for long charging hours or remote working inside.',
        address: 'Bungalow 7, Rambaug Colony, Kothrud, Pune, Maharashtra 411038',
        lat: 18.5074, lng: 73.8077,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Viman Nagar Residential EV Dock',
        description: 'Slow AC socket in a residential basement parking. Safe overnight parking slot near Datta Mandir Chowk.',
        address: 'Pine Court Apartments, Viman Nagar, Pune, Maharashtra 411014',
        lat: 18.5679, lng: 73.9143,
        connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 9.00, markupPercent: 20,
        photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Indiranagar Private Garage Charger',
        description: 'AC wallbox in an Indiranagar bungalow garage. Secure, private access. Cafes and restaurants within walking distance.',
        address: '82, 100 Feet Rd, Indiranagar, Bangalore, Karnataka 560038',
        lat: 12.9718, lng: 77.6411,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 14.50, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'HSR Layout Sector 3 Driveway Wallbox',
        description: 'High-capacity AC charging in HSR Sector 3. Gated residence driveway, suitable for all types of electric cars.',
        address: '245, 19th Main, HSR Layout, Sector 3, Bangalore, Karnataka 560102',
        lat: 12.9100, lng: 77.6450,
        connectorType: 'Type2', speedKw: 11, pricePerKwh: 15.00, markupPercent: 35,
        photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
      {
        merchantId: hostUser._id,
        title: 'Vasant Kunj Bungalow Power Dock',
        description: 'Clean AC charging port in Sector C, Vasant Kunj bungalow. Dedicated EV parking spot under a shade.',
        address: 'Pocket 8, Sector C, Vasant Kunj, New Delhi, Delhi 110070',
        lat: 28.5292, lng: 77.1522,
        connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.50, markupPercent: 30,
        photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        isLive: true,
      },
    ];

    const createdChargers = await Charger.insertMany(chargers);
    console.log(`${createdChargers.length} seed chargers inserted successfully across ALL INDIA!`);

    // Create a mock review for the first charger
    await Review.create({
      userId: driverUser._id,
      chargerId: createdChargers[0]._id,
      rating: 5,
      comment: 'Super fast charging and clean waiting area! The host Rajesh was very friendly and offered water.',
    });

    // Create a mock booking for the first charger
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await Booking.create({
      userId: driverUser._id,
      chargerId: createdChargers[0]._id,
      scheduledAt: yesterday,
      durationMinutes: 60,
      estimatedCost: 35.5 * 1.35, // mock estimation
      status: 'completed',
      paymentId: 'pay_mock_12345',
    });

    console.log('Seed reviews and bookings created.');

    mongoose.connection.close();
    console.log('Database seeding completed. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
