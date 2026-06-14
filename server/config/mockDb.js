import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (modelName) => path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);

const readData = (modelName) => {
  const filePath = getFilePath(modelName);
  if (!fs.existsSync(filePath)) {
    // Return empty array or default seeded data
    if (modelName === 'User') return getDefaultUsers();
    if (modelName === 'Charger') return getDefaultChargers();
    if (modelName === 'Booking') return getDefaultBookings();
    if (modelName === 'Review') return getDefaultReviews();
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error reading mock file for ${modelName}:`, error);
    return [];
  }
};

const writeData = (modelName, data) => {
  const filePath = getFilePath(modelName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing mock file for ${modelName}:`, error);
  }
};

// Seed defaults
const getDefaultUsers = () => {
  const hostId = '666a2b3c4d5e6f7a8b9c0d01';
  const driverId = '666a2b3c4d5e6f7a8b9c0d02';
  
  // Correct bcrypt hash for 'password123' (bcrypt.hash('password123', 10))
  const DEMO_PASSWORD_HASH = '$2a$10$PIvIxhntPrnavuMPd2Tiluq2vn4nNoZOjBLcN1iMaXm7R2APTtwPy';

  const users = [
    {
      _id: hostId,
      name: 'Rajesh Sharma (Host)',
      email: 'host@evnest.com',
      password: DEMO_PASSWORD_HASH,
      role: 'merchant',
      carModel: '',
      batteryCapacityKwh: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: driverId,
      name: 'Amit Patel (Driver)',
      email: 'user@evnest.com',
      password: DEMO_PASSWORD_HASH,
      role: 'user',
      carModel: 'Tata Nexon EV Max',
      batteryCapacityKwh: 40.5,
      createdAt: new Date().toISOString(),
    }
  ];
  
  writeData('User', users);
  return users;
};

const getDefaultChargers = () => {
  const hostId = '666a2b3c4d5e6f7a8b9c0d01';
  const ts = new Date().toISOString();
  const chargers = [
    // ── WEST INDIA — Gujarat ──────────────────────────────────────────
    { _id: '666c00000000000000000001', merchantId: hostId, title: 'Surat Ring Road Fast DC', description: 'High speed CCS dual-gun charger in hotel parking lot. 24/7 access with lounge and food nearby.', address: 'Ring Rd, near Sahara Darwaja, Surat, Gujarat 395002', lat: 21.1895, lng: 72.8398, connectorType: 'CCS', speedKw: 50, pricePerKwh: 18.50, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000002', merchantId: hostId, title: 'Ahmedabad SG Highway EV Hub', description: 'Rapid 120kW charging station inside Dev Arc Mall. Enjoy shopping while your vehicle charges.', address: 'Sarkhej - Gandhinagar Hwy, near ISKCON Cross Road, Ahmedabad, Gujarat 380015', lat: 23.0245, lng: 72.5074, connectorType: 'CCS', speedKw: 120, pricePerKwh: 22.00, markupPercent: 50, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000003', merchantId: hostId, title: 'Vadodara Alkapuri AC Charger', description: 'Convenient AC charging station ideal for office goers. Secure parking inside commercial complex.', address: 'Alkapuri Rd, opposite Alkapuri Club, Vadodara, Gujarat 390007', lat: 22.3112, lng: 73.1695, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000004', merchantId: hostId, title: 'Gandhinagar Sector 11 Bharat AC', description: 'Affordable low speed charger for daily commuters. Situated close to government offices.', address: 'Sector 11, Gandhinagar, Gujarat 382011', lat: 23.2201, lng: 72.6420, connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.50, markupPercent: 20, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000005', merchantId: hostId, title: 'Rajkot Kalawad Road Charger', description: 'DC fast charger near Rajkot city center. Located at a petrol pump with refreshments available.', address: 'Kalawad Rd, near Aji Dam, Rajkot, Gujarat 360005', lat: 22.2916, lng: 70.7636, connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000006', merchantId: hostId, title: 'Navsari NH-48 Eco Station', description: 'Slow AC charger on the highway. Secure private house front-yard. Toilet and water available.', address: 'National Highway 48, near Navsari, Gujarat 396445', lat: 20.9592, lng: 72.9430, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── WEST INDIA — Maharashtra ──────────────────────────────────────
    { _id: '666c00000000000000000007', merchantId: hostId, title: 'Mumbai Bandra West Premium DC', description: 'Premium CCS charger in secure residential society garage. Safe, clean, 24/7 access.', address: 'Carter Rd, Bandra West, Mumbai, Maharashtra 400050', lat: 19.0600, lng: 72.8230, connectorType: 'CCS', speedKw: 60, pricePerKwh: 24.50, markupPercent: 50, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000008', merchantId: hostId, title: 'Mumbai Andheri Local AC', description: 'Type2 charger in Andheri West near Metro station. Park and charge while commuting.', address: 'DN Nagar, Andheri West, Mumbai, Maharashtra 400053', lat: 19.1280, lng: 72.8360, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 14.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000009', merchantId: hostId, title: 'Pune Koregaon Park Smart AC', description: 'Quiet AC charger located in a private bungalow driveway. Safe for overnight or afternoon charging.', address: 'Lane 5, Koregaon Park, Pune, Maharashtra 411001', lat: 18.5392, lng: 73.8925, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.50, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000000a', merchantId: hostId, title: 'Pune Hinjewadi IT Park DC', description: 'Fast 120kW charger inside IT park campus. Ideal for techies who need a quick top-up.', address: 'Phase 1, Hinjewadi, Pune, Maharashtra 411057', lat: 18.5912, lng: 73.7389, connectorType: 'CCS', speedKw: 120, pricePerKwh: 20.00, markupPercent: 45, photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000000b', merchantId: hostId, title: 'Nagpur Sitabuldi Local AC', description: 'Centrally located Type2 charger in Nagpur city. Near main market and railway station.', address: 'Sitabuldi, Nagpur, Maharashtra 440012', lat: 21.1458, lng: 79.0882, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000000c', merchantId: hostId, title: 'Nashik College Rd Charger', description: 'DC fast charger near Nashik wine country. Located at a restaurant with garden seating.', address: 'College Road, Nashik, Maharashtra 422005', lat: 19.9975, lng: 73.7898, connectorType: 'CCS', speedKw: 50, pricePerKwh: 17.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── HIGHWAY — Mumbai-Pune Expressway ─────────────────────────────
    { _id: '666c0000000000000000000d', merchantId: hostId, title: 'Lonavala Highway Pitstop Charger', description: 'Rapid charging stop for travelers heading to Pune/Mumbai. Located at Sunny Da Dhaba parking.', address: 'Mumbai-Pune Expressway, Lonavala, Maharashtra 410401', lat: 18.7610, lng: 73.4350, connectorType: 'CCS', speedKw: 50, pricePerKwh: 19.00, markupPercent: 50, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000000e', merchantId: hostId, title: 'Khalapur Expressway Charger', description: 'CCS fast charger at Khalapur toll plaza food court. Rest and recharge your EV.', address: 'Mumbai-Pune Expressway, Khalapur, Maharashtra 410202', lat: 18.8200, lng: 73.2800, connectorType: 'CCS', speedKw: 60, pricePerKwh: 20.00, markupPercent: 45, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── NORTH INDIA — Delhi NCR ─────────────────────────────────────
    { _id: '666c0000000000000000000f', merchantId: hostId, title: 'Delhi Connaught Place Fast DC', description: 'Premium 150kW DC fast charger in the heart of Delhi. Underground parking with 24/7 security.', address: 'Connaught Place, New Delhi, Delhi 110001', lat: 28.6315, lng: 77.2167, connectorType: 'CCS', speedKw: 150, pricePerKwh: 22.00, markupPercent: 50, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000010', merchantId: hostId, title: 'Delhi Dwarka Sector 21 AC', description: 'Residential society charger in Dwarka. Perfect for overnight charging near metro station.', address: 'Sector 21, Dwarka, New Delhi, Delhi 110077', lat: 28.5521, lng: 77.0581, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000011', merchantId: hostId, title: 'Gurgaon Cyber Hub DC Charger', description: '120kW fast charger at DLF Cyber Hub. Charge while you dine at premium restaurants.', address: 'DLF Cyber City, Gurugram, Haryana 122002', lat: 28.4949, lng: 77.0880, connectorType: 'CCS', speedKw: 120, pricePerKwh: 20.00, markupPercent: 45, photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000012', merchantId: hostId, title: 'Noida Sector 18 Market Charger', description: 'CHAdeMO charger at Atta Market parking. Great for shoppers and visitors.', address: 'Sector 18, Noida, Uttar Pradesh 201301', lat: 28.5690, lng: 77.3210, connectorType: 'CHAdeMO', speedKw: 50, pricePerKwh: 15.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── NORTH INDIA — UP, Rajasthan, Punjab, Uttarakhand ────────────
    { _id: '666c00000000000000000013', merchantId: hostId, title: 'Lucknow Hazratganj Local AC', description: 'Type2 AC charger in central Lucknow. Walking distance to Hazratganj market.', address: 'Hazratganj, Lucknow, Uttar Pradesh 226001', lat: 26.8530, lng: 80.9468, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 10.50, markupPercent: 25, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000014', merchantId: hostId, title: 'Jaipur MI Road Fast Charger', description: 'CCS fast charger on the main MI Road. Located at a heritage hotel with lounge access.', address: 'MI Road, Jaipur, Rajasthan 302001', lat: 26.9124, lng: 75.7873, connectorType: 'CCS', speedKw: 60, pricePerKwh: 18.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000015', merchantId: hostId, title: 'Chandigarh Sector 17 DC', description: 'High-speed DC charger in Chandigarh city center. Near the famous Sector 17 plaza.', address: 'Sector 17, Chandigarh 160017', lat: 30.7412, lng: 76.7838, connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000016', merchantId: hostId, title: 'Amritsar Golden Temple Rd Charger', description: 'Local Bharat AC charger near the Golden Temple area. Affordable rates for pilgrims and tourists.', address: 'Golden Temple Rd, Amritsar, Punjab 143001', lat: 31.6200, lng: 74.8765, connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.00, markupPercent: 20, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000017', merchantId: hostId, title: 'Dehradun Rajpur Road Charger', description: 'Type2 charger at a cozy café on Rajpur Road. Charge your EV while enjoying mountain views.', address: 'Rajpur Road, Dehradun, Uttarakhand 248001', lat: 30.3565, lng: 78.0580, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── HIGHWAY — Delhi-Jaipur (NH-48) ──────────────────────────────
    { _id: '666c00000000000000000018', merchantId: hostId, title: 'Manesar NH-48 Highway Charger', description: 'Fast charger at Manesar industrial area on Delhi-Jaipur highway. Dhaba and restrooms nearby.', address: 'NH-48, Manesar, Haryana 122051', lat: 28.3590, lng: 76.9370, connectorType: 'CCS', speedKw: 60, pricePerKwh: 17.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000019', merchantId: hostId, title: 'Neemrana Fort Highway Stop', description: 'CCS charger at Neemrana Fort Palace parking. Heritage tourism meets EV charging.', address: 'NH-48, Neemrana, Rajasthan 301705', lat: 27.9860, lng: 76.3830, connectorType: 'CCS', speedKw: 50, pricePerKwh: 18.00, markupPercent: 45, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── HIGHWAY — Delhi-Agra Yamuna Expressway ──────────────────────
    { _id: '666c0000000000000000001a', merchantId: hostId, title: 'Mathura Yamuna Expressway Charger', description: 'DC fast charger at Yamuna Expressway rest area. On the way to Agra and Taj Mahal.', address: 'Yamuna Expressway, Mathura, UP 281001', lat: 27.4924, lng: 77.6737, connectorType: 'CCS', speedKw: 60, pricePerKwh: 16.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── SOUTH INDIA — Karnataka ─────────────────────────────────────
    { _id: '666c0000000000000000001b', merchantId: hostId, title: 'Bangalore Koramangala DC Hub', description: '150kW ultra-fast charger at a tech park in Koramangala. Multiple CCS connectors available.', address: '1st Block, Koramangala, Bangalore, Karnataka 560034', lat: 12.9352, lng: 77.6245, connectorType: 'CCS', speedKw: 150, pricePerKwh: 21.00, markupPercent: 50, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000001c', merchantId: hostId, title: 'Bangalore Whitefield IT Charger', description: 'Fast DC charger inside ITPL tech park. Perfect for IT professionals during work hours.', address: 'ITPL Main Rd, Whitefield, Bangalore, Karnataka 560066', lat: 12.9698, lng: 77.7500, connectorType: 'CCS', speedKw: 60, pricePerKwh: 18.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000001d', merchantId: hostId, title: 'Mysore Devaraja Market Charger', description: 'Local AC charger near famous Devaraja Market. Heritage area with plenty of attractions.', address: 'Dhanvanthri Rd, Mysore, Karnataka 570001', lat: 12.3051, lng: 76.6551, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── SOUTH INDIA — Tamil Nadu ────────────────────────────────────
    { _id: '666c0000000000000000001e', merchantId: hostId, title: 'Chennai OMR Tech Corridor DC', description: 'Ultra-fast 150kW charger on Old Mahabalipuram Road. Serves the IT corridor commuters.', address: 'OMR, Sholinganallur, Chennai, Tamil Nadu 600119', lat: 12.9010, lng: 80.2279, connectorType: 'CCS', speedKw: 150, pricePerKwh: 20.00, markupPercent: 45, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000001f', merchantId: hostId, title: 'Chennai T Nagar Local Charger', description: 'Type2 AC charger at Pondy Bazaar shopping area. Charge while shopping at T Nagar.', address: 'Pondy Bazaar, T Nagar, Chennai, Tamil Nadu 600017', lat: 13.0418, lng: 80.2341, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000020', merchantId: hostId, title: 'Coimbatore RS Puram Charger', description: 'Local CHAdeMO charger in Coimbatore city. Near RS Puram market with restrooms available.', address: 'RS Puram, Coimbatore, Tamil Nadu 641002', lat: 11.0043, lng: 76.9558, connectorType: 'CHAdeMO', speedKw: 50, pricePerKwh: 14.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000021', merchantId: hostId, title: 'Madurai Meenakshi Temple Charger', description: 'Bharat AC charger near the iconic Meenakshi Temple. Affordable rates for locals and tourists.', address: 'North Masi St, Madurai, Tamil Nadu 625001', lat: 9.9195, lng: 78.1193, connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.00, markupPercent: 20, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── SOUTH INDIA — Kerala & Telangana ────────────────────────────
    { _id: '666c00000000000000000022', merchantId: hostId, title: 'Kochi Marine Drive AC Charger', description: 'Scenic waterfront AC charger near Marine Drive promenade. Beautiful charging experience.', address: 'Marine Drive, Ernakulam, Kochi, Kerala 682031', lat: 9.9816, lng: 76.2757, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000023', merchantId: hostId, title: 'Trivandrum Technopark DC', description: 'Fast DC charger inside Technopark campus. Ideal for IT employees in Trivandrum.', address: 'Technopark, Trivandrum, Kerala 695581', lat: 8.5568, lng: 76.8816, connectorType: 'CCS', speedKw: 60, pricePerKwh: 17.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000024', merchantId: hostId, title: 'Hyderabad HITEC City Fast DC', description: '120kW fast charger in HITEC City IT hub. Multiple parking bays dedicated for EV charging.', address: 'HITEC City, Hyderabad, Telangana 500081', lat: 17.4435, lng: 78.3772, connectorType: 'CCS', speedKw: 120, pricePerKwh: 19.00, markupPercent: 45, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000025', merchantId: hostId, title: 'Hyderabad Charminar Local AC', description: 'Affordable AC charger in the old city near Charminar. Local area community charger.', address: 'Charminar, Hyderabad, Telangana 500002', lat: 17.3616, lng: 78.4747, connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 9.00, markupPercent: 25, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── HIGHWAY — Bangalore-Chennai & Hyderabad-Bangalore ───────────
    { _id: '666c00000000000000000026', merchantId: hostId, title: 'Vellore NH-46 Highway Charger', description: 'CCS fast charger on NH-46 between Bangalore and Chennai. Dhaba with south Indian food.', address: 'NH-46, Vellore, Tamil Nadu 632001', lat: 12.9165, lng: 79.1325, connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000027', merchantId: hostId, title: 'Anantapur NH-44 Highway Charger', description: "Highway DC charger on India's longest national highway. Rest area with food court.", address: 'NH-44, Anantapur, Andhra Pradesh 515001', lat: 14.6819, lng: 77.6006, connectorType: 'CCS', speedKw: 60, pricePerKwh: 15.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── EAST INDIA — West Bengal, Odisha, Bihar ─────────────────────
    { _id: '666c00000000000000000028', merchantId: hostId, title: 'Kolkata Salt Lake DC Charger', description: 'Fast 60kW DC charger in Salt Lake Sector V IT hub. Popular among tech commuters.', address: 'Sector V, Salt Lake, Kolkata, West Bengal 700091', lat: 22.5744, lng: 88.4344, connectorType: 'CCS', speedKw: 60, pricePerKwh: 16.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000029', merchantId: hostId, title: 'Kolkata Park Street Local AC', description: "Type2 charger at Park Street heritage area. Charge while exploring Kolkata's nightlife.", address: 'Park Street, Kolkata, West Bengal 700016', lat: 22.5520, lng: 88.3508, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 25, photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000002a', merchantId: hostId, title: 'Bhubaneswar Patia Local Charger', description: 'AC charger near KIIT University. Popular among students and local residents.', address: 'Patia, Bhubaneswar, Odisha 751024', lat: 20.3540, lng: 85.8190, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 10.00, markupPercent: 25, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000002b', merchantId: hostId, title: 'Patna Boring Road Charger', description: 'CCS fast charger on Boring Road, Patna. Located at a mall parking lot with food court.', address: 'Boring Rd, Patna, Bihar 800001', lat: 25.6093, lng: 85.1376, connectorType: 'CCS', speedKw: 50, pricePerKwh: 14.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── CENTRAL INDIA — MP, Chhattisgarh ────────────────────────────
    { _id: '666c0000000000000000002c', merchantId: hostId, title: 'Bhopal New Market DC Charger', description: 'DC fast charger near New Market area. Close to Upper Lake with scenic surroundings.', address: 'New Market, Bhopal, Madhya Pradesh 462003', lat: 23.2332, lng: 77.4263, connectorType: 'CCS', speedKw: 50, pricePerKwh: 15.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000002d', merchantId: hostId, title: 'Indore Vijay Nagar Local AC', description: 'Affordable Type2 charger in the cleanest city of India. Located near Treasure Island Mall.', address: 'Vijay Nagar, Indore, Madhya Pradesh 452010', lat: 22.7533, lng: 75.8937, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000002e', merchantId: hostId, title: 'Raipur Telibandha Charger', description: 'Local DC charger near Telibandha Lake. Peaceful area with garden and walking trails.', address: 'Telibandha, Raipur, Chhattisgarh 492001', lat: 21.2415, lng: 81.6296, connectorType: 'CCS', speedKw: 50, pricePerKwh: 13.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── HIGHWAY — NH-44 (Delhi-Chennai corridor) ────────────────────
    { _id: '666c0000000000000000002f', merchantId: hostId, title: 'Nagpur Wardha Rd Highway Charger', description: 'Highway charger on Wardha Road connecting Nagpur to southern India. Truck stop with food.', address: 'Wardha Rd, NH-44, Nagpur, Maharashtra 440015', lat: 21.0918, lng: 79.1260, connectorType: 'CCS', speedKw: 60, pricePerKwh: 15.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── NORTHEAST INDIA ─────────────────────────────────────────────
    { _id: '666c00000000000000000030', merchantId: hostId, title: 'Guwahati GS Road DC Charger', description: 'First fast charger in Guwahati city. Located on GS Road near Ganeshguri flyover.', address: 'GS Road, Ganeshguri, Guwahati, Assam 781006', lat: 26.1486, lng: 91.7745, connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000031', merchantId: hostId, title: 'Shillong Police Bazaar AC', description: 'Community AC charger in the Scotland of the East. Located near the bustling Police Bazaar.', address: 'Police Bazaar, Shillong, Meghalaya 793001', lat: 25.5729, lng: 91.8787, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── GOA & COASTAL HIGHWAY ───────────────────────────────────────
    { _id: '666c00000000000000000032', merchantId: hostId, title: 'Goa Panjim Beach Road Charger', description: 'Tourist-friendly charger near Miramar Beach. Perfect for rental EV tourists exploring Goa.', address: 'DB Marg, Panjim, Goa 403001', lat: 15.4989, lng: 73.8278, connectorType: 'CCS', speedKw: 50, pricePerKwh: 18.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000033', merchantId: hostId, title: 'Ratnagiri NH-66 Highway Charger', description: 'Coastal highway charger between Mumbai and Goa. Located at a seafood restaurant parking.', address: 'NH-66, Ratnagiri, Maharashtra 415612', lat: 16.9944, lng: 73.3000, connectorType: 'CCS', speedKw: 50, pricePerKwh: 17.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },

    // ── RAJASTHAN & J&K ─────────────────────────────────────────────
    { _id: '666c00000000000000000034', merchantId: hostId, title: 'Udaipur Fateh Sagar Lake Charger', description: 'Scenic charger near Fateh Sagar Lake. A must-stop for tourists exploring the City of Lakes.', address: 'Fateh Sagar Rd, Udaipur, Rajasthan 313001', lat: 24.5926, lng: 73.6780, connectorType: 'CCS', speedKw: 50, pricePerKwh: 16.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000035', merchantId: hostId, title: 'Srinagar Dal Lake Road Charger', description: 'AC charger near the iconic Dal Lake. For tourists exploring Kashmir in electric vehicles.', address: 'Boulevard Road, Dal Lake, Srinagar, J&K 190001', lat: 34.0911, lng: 74.8560, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 14.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    
    // ── NEW LOCAL RESIDENTIAL CHARGERS (Airbnb-Style Peer-to-Peer) ────
    { _id: '666c00000000000000000036', merchantId: hostId, title: 'Adajan Home Garage Charger', description: 'Private residential garage charger in Adajan. Clean, safe parking slot with friendly host. Tea and water available.', address: 'A-102, Vasanji Nagar, near Star Bazar, Adajan, Surat, Gujarat 395009', lat: 21.1960, lng: 72.7950, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 11.50, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000037', merchantId: hostId, title: 'Vesu VIP Road Bungalow Port', description: 'Low-speed Bharat AC wallbox in private bungalow driveway. Accessible 24/7 with CCTV protection.', address: 'Bungalow 14, Royal Greens, VIP Road, Vesu, Surat, Gujarat 395007', lat: 21.1350, lng: 72.7720, connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 8.00, markupPercent: 20, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000038', merchantId: hostId, title: 'Juhu Beach Private Driveway', description: 'Type2 AC charger in Juhu beach residential driveway. Safe gated society with security guard. Walk on the beach while charging.', address: 'Plot 45, Juhu Tara Rd, near Juhu Beach, Mumbai, Maharashtra 400049', lat: 19.1020, lng: 72.8260, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 15.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c00000000000000000039', merchantId: hostId, title: 'Worli Seaface Residential Slot', description: 'Premium 11kW Type2 charger in high-rise society parking. Secure access with overnight charging allowed.', address: 'Block C, Sea Breeze Apartments, Worli Sea Face, Mumbai, Maharashtra 400030', lat: 19.0080, lng: 72.8150, connectorType: 'Type2', speedKw: 11, pricePerKwh: 18.00, markupPercent: 40, photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000003a', merchantId: hostId, title: 'Chembur Society AC Charger', description: 'Community charger in a quiet Chembur neighborhood. Convenient location, close to Eastern Express Highway.', address: 'Central Avenue Rd, near Diamond Garden, Chembur, Mumbai, Maharashtra 400071', lat: 19.0620, lng: 72.8980, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000003b', merchantId: hostId, title: 'Kothrud Bungalow Private Charger', description: 'Quiet private driveway charger in a green Kothrud lane. Safe for long charging hours or remote working inside.', address: 'Bungalow 7, Rambaug Colony, Kothrud, Pune, Maharashtra 411038', lat: 18.5074, lng: 73.8077, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 12.00, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1563720223061-e5d05a415668?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000003c', merchantId: hostId, title: 'Viman Nagar Residential EV Dock', description: 'Slow AC socket in a residential basement parking. Safe overnight parking slot near Datta Mandir Chowk.', address: 'Pine Court Apartments, Viman Nagar, Pune, Maharashtra 411014', lat: 18.5679, lng: 73.9143, connectorType: 'Bharat AC', speedKw: 3.3, pricePerKwh: 9.00, markupPercent: 20, photos: ['https://images.unsplash.com/photo-1616432043562-3671ea2e5259?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000003d', merchantId: hostId, title: 'Indiranagar Private Garage Charger', description: 'AC wallbox in an Indiranagar bungalow garage. Secure, private access. Cafes and restaurants within walking distance.', address: '82, 100 Feet Rd, Indiranagar, Bangalore, Karnataka 560038', lat: 12.9718, lng: 77.6411, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 14.50, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000003e', merchantId: hostId, title: 'HSR Layout Sector 3 Driveway Wallbox', description: 'High-capacity AC charging in HSR Sector 3. Gated residence driveway, suitable for all types of electric cars.', address: '245, 19th Main, HSR Layout, Sector 3, Bangalore, Karnataka 560102', lat: 12.9100, lng: 77.6450, connectorType: 'Type2', speedKw: 11, pricePerKwh: 15.00, markupPercent: 35, photos: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts },
    { _id: '666c0000000000000000003f', merchantId: hostId, title: 'Vasant Kunj Bungalow Power Dock', description: 'Clean AC charging port in Sector C, Vasant Kunj bungalow. Dedicated EV parking spot under a shade.', address: 'Pocket 8, Sector C, Vasant Kunj, New Delhi, Delhi 110070', lat: 28.5292, lng: 77.1522, connectorType: 'Type2', speedKw: 7.4, pricePerKwh: 13.50, markupPercent: 30, photos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'], isLive: true, createdAt: ts }
  ];
  
  writeData('Charger', chargers);
  return chargers;
};

const getDefaultBookings = () => {
  const driverId = '666a2b3c4d5e6f7a8b9c0d02';
  const chargerId = '666c00000000000000000001';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const bookings = [
    {
      _id: '666d00000000000000000001',
      userId: driverId,
      chargerId: chargerId,
      scheduledAt: yesterday.toISOString(),
      durationMinutes: 60,
      estimatedCost: 35.5 * 1.35,
      status: 'completed',
      paymentId: 'pay_mock_12345',
      createdAt: yesterday.toISOString(),
    }
  ];
  
  writeData('Booking', bookings);
  return bookings;
};

const getDefaultReviews = () => {
  const driverId = '666a2b3c4d5e6f7a8b9c0d02';
  const chargerId = '666c00000000000000000001';
  
  const reviews = [
    {
      _id: '666e00000000000000000001',
      userId: driverId,
      chargerId: chargerId,
      rating: 5,
      comment: 'Super fast charging and clean waiting area! The host Rajesh was very friendly and offered water.',
      createdAt: new Date().toISOString(),
    }
  ];
  
  writeData('Review', reviews);
  return reviews;
};

class MockQuery {
  constructor(data, modelName) {
    this.data = data;
    this.modelName = modelName;
  }

  _resolveField(item, fieldName, nestedPopulate) {
    if (!item) return item;
    const newItem = { ...item };

    if (fieldName === 'userId' || fieldName.includes('userId')) {
      const users = readData('User');
      const idVal = typeof item.userId === 'object' ? item.userId?._id : item.userId;
      const userObj = users.find(u => u._id?.toString() === idVal?.toString());
      if (userObj) {
        const cleanUser = { ...userObj };
        delete cleanUser.password;
        newItem.userId = cleanUser;
      }
    }

    if (fieldName === 'chargerId' || fieldName.includes('chargerId')) {
      const chargers = readData('Charger');
      const idVal = typeof item.chargerId === 'object' ? item.chargerId?._id : item.chargerId;
      const chargerObj = chargers.find(c => c._id?.toString() === idVal?.toString());
      if (chargerObj) {
        const newCharger = { ...chargerObj };
        // Nested populate: also expand merchantId inside charger
        if (nestedPopulate) {
          const nestedField = typeof nestedPopulate === 'object' ? nestedPopulate.path : nestedPopulate;
          if (nestedField === 'merchantId') {
            const users = readData('User');
            const hostObj = users.find(u => u._id?.toString() === newCharger.merchantId?.toString());
            if (hostObj) {
              const cleanHost = { ...hostObj };
              delete cleanHost.password;
              newCharger.merchantId = cleanHost;
            }
          }
        }
        newItem.chargerId = newCharger;
      }
    }

    if (fieldName === 'merchantId' || fieldName.includes('merchantId')) {
      const users = readData('User');
      const idVal = typeof item.merchantId === 'object' ? item.merchantId?._id : item.merchantId;
      const hostObj = users.find(u => u._id?.toString() === idVal?.toString());
      if (hostObj) {
        const cleanHost = { ...hostObj };
        delete cleanHost.password;
        newItem.merchantId = cleanHost;
      }
    }

    return newItem;
  }

  populate(pathArg, select) {
    if (!this.data) return this;

    // Support both string and object format: {path, populate, select}
    const fieldName = typeof pathArg === 'object' ? pathArg.path : pathArg;
    const nestedPopulate = typeof pathArg === 'object' ? pathArg.populate : null;

    const resolveItem = (item) => this._resolveField(item, fieldName, nestedPopulate);

    if (Array.isArray(this.data)) {
      this.data = this.data.map(resolveItem);
    } else {
      this.data = resolveItem(this.data);
    }

    return this;
  }

  sort(criteria) {
    if (!Array.isArray(this.data)) return this;
    const key = Object.keys(criteria)[0];
    const order = criteria[key];
    this.data.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      if (typeof valA === 'string') {
        return order === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 1 ? valA - valB : valB - valA;
    });
    return this;
  }

  limit(n) {
    if (Array.isArray(this.data) && n) {
      this.data = this.data.slice(0, n);
    }
    return this;
  }

  select(fields) {
    if (!this.data) return this;
    const processItem = (item) => {
      if (!item) return item;
      const newItem = { ...item };
      if (typeof fields === 'string') {
        fields.split(' ').forEach(f => {
          if (f.startsWith('-')) delete newItem[f.substring(1)];
        });
      }
      return newItem;
    };
    if (Array.isArray(this.data)) {
      this.data = this.data.map(processItem);
    } else {
      this.data = processItem(this.data);
    }
    return this;
  }

  // Support both await and .then() chaining
  then(resolve, reject) {
    try {
      resolve(this.data);
    } catch (e) {
      if (reject) reject(e);
    }
  }
}

class MockModel {
  constructor(modelName) {
    this.modelName = modelName;
  }
  
  find(query = {}) {
    let list = readData(this.modelName);
    
    // Filter matching parameters
    Object.keys(query).forEach((key) => {
      const val = query[key];
      if (val === undefined) return;
      
      if (typeof val === 'object' && val !== null) {
        // Regex search
        if (val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || 'i');
          list = list.filter(item => regex.test(item[key]));
        }
        // Operator search
        else if (val.$lte !== undefined) {
          list = list.filter(item => item[key] <= val.$lte);
        }
        else if (val.$gte !== undefined) {
          list = list.filter(item => item[key] >= val.$gte);
        }
        else if (val.$in !== undefined) {
          const inArr = val.$in.map(id => id.toString());
          list = list.filter(item => inArr.includes(item[key]?.toString()));
        }
      } else {
        // Direct value match
        list = list.filter(item => item[key]?.toString() === val?.toString());
      }
    });
    
    return new MockQuery(list, this.modelName);
  }
  
  findOne(query = {}) {
    const list = this.find(query).data;
    const item = list.length > 0 ? list[0] : null;
    return new MockQuery(item, this.modelName);
  }
  
  findById(id) {
    const list = readData(this.modelName);
    const modelName = this.modelName;
    const item = list.find(item => item._id?.toString() === id?.toString());
    if (!item) return new MockQuery(null, this.modelName);

    // Attach a save() method so callers can mutate then save
    const itemWithSave = {
      ...item,
      save: async function() {
        const currentList = readData(modelName);
        const idx = currentList.findIndex(d => d._id?.toString() === this._id?.toString());
        const updated = { ...this };
        delete updated.save; // don't persist the save method
        updated.updatedAt = new Date().toISOString();
        if (idx !== -1) {
          currentList[idx] = updated;
        } else {
          currentList.push(updated);
        }
        writeData(modelName, currentList);
        return updated;
      }
    };
    return new MockQuery(itemWithSave, this.modelName);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = readData(this.modelName);
    const idx = list.findIndex(item => item._id?.toString() === id?.toString());
    if (idx === -1) return null;
    const updatedItem = { ...list[idx], ...update, updatedAt: new Date().toISOString() };
    list[idx] = updatedItem;
    writeData(this.modelName, list);
    return updatedItem;
  }
  
  async create(data) {
    const list = readData(this.modelName);
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(2, 6),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newItem);
    writeData(this.modelName, list);
    return newItem;
  }
  
  async findByIdAndDelete(id) {
    let list = readData(this.modelName);
    const exists = list.some(item => item._id?.toString() === id?.toString());
    if (exists) {
      list = list.filter(item => item._id?.toString() !== id?.toString());
      writeData(this.modelName, list);
      return { _id: id };
    }
    return null;
  }
  
  // Instance creator mock wrapper
  buildInstance(data) {
    const modelName = this.modelName;
    return {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(2, 6),
      ...data,
      save: async function() {
        const list = readData(modelName);
        const idx = list.findIndex(item => item._id === this._id);
        
        this.updatedAt = new Date().toISOString();
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...this };
        } else {
          this.createdAt = new Date().toISOString();
          list.push({ ...this });
        }
        
        writeData(modelName, list);
        return this;
      }
    };
  }
}

const mockModels = {};

export const getMockModel = (modelName) => {
  if (!mockModels[modelName]) {
    mockModels[modelName] = new MockModel(modelName);
  }
  return mockModels[modelName];
};
