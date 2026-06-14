import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Charger from '../models/Charger.js';

const router = express.Router();

// Fallback logic in case Gemini key is missing or invalid
const fallbackIntentParser = (message) => {
  const text = message.toLowerCase();
  
  // 1. Extract location
  let location = null;
  const cities = ['surat', 'ahmedabad', 'mumbai', 'pune', 'vadodara', 'rajkot', 'gandhinagar', 'navsari', 'thane', 'lonavala', 'panvel', 'mahabaleshwar'];
  for (const city of cities) {
    if (text.includes(city)) {
      location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }
  // If no city matches, look for "near <word>"
  if (!location) {
    const nearMatch = text.match(/near\s+([a-z]+)/i);
    if (nearMatch && nearMatch[1]) {
      location = nearMatch[1].charAt(0).toUpperCase() + nearMatch[1].slice(1);
    }
  }

  // 2. Extract maxPrice
  let maxPrice = null;
  const priceMatch = text.match(/(?:under|below|max|upto|rs\.?|₹)\s*(\d+)/i) || text.match(/(\d+)\s*(?:rs|₹|rupees)/i);
  if (priceMatch && priceMatch[1]) {
    maxPrice = Number(priceMatch[1]);
  }

  // 3. Extract connectorType
  let connectorType = null;
  const connectors = ['type2', 'ccs', 'chademo', 'bharat ac'];
  for (const conn of connectors) {
    if (text.includes(conn)) {
      if (conn === 'type2') connectorType = 'Type2';
      else if (conn === 'ccs') connectorType = 'CCS';
      else if (conn === 'chademo') connectorType = 'CHAdeMO';
      else if (conn === 'bharat ac') connectorType = 'Bharat AC';
      break;
    }
  }
  if (!connectorType) {
    if (text.includes('fast') || text.includes('dc')) {
      connectorType = 'CCS'; // default fast
    } else if (text.includes('slow') || text.includes('ac')) {
      connectorType = 'Type2'; // default slow
    }
  }

  // 4. Extract carModel
  let carModel = null;
  const cars = ['nexon', 'zs ev', 'tiago', 'tigor', 'atto 3', 'ev6', 'i4', 'taycan', 'kona', 'comet', 'punch', 'xuv400', 'e-verito', 'byd e6', 'ioniq 5'];
  for (const car of cars) {
    if (text.includes(car)) {
      carModel = car.toUpperCase();
      break;
    }
  }

  return { location, maxPrice, connectorType, carModel };
};

// @desc    Parse message with Gemini and fetch relevant chargers
// @route   POST /api/ai/chat
// @access  Public
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  let parsedIntent = {
    location: null,
    maxPrice: null,
    connectorType: null,
    carModel: null,
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const isMockKey = !apiKey || apiKey === 'mock_key_or_real_gemini_api_key' || apiKey.startsWith('mock');

  if (!isMockKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are an EV charging assistant. Extract from the user's message: location (string), maxPrice (number, ₹/kWh), connectorType (string or null), carModel (string or null). Return ONLY a JSON object with these four fields: "location", "maxPrice", "connectorType", "carModel". If a field is not mentioned, return null for it. Do not include markdown code block formatting (no \`\`\`json tags), just raw JSON.`;

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Message: "${message}"` }] }],
      });

      const responseText = response.response.text().trim();
      
      // Clean up markdown block wrapping if present
      let cleanText = responseText;
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```(?:json)?/g, '').trim();
      }

      parsedIntent = JSON.parse(cleanText);
      console.log('Gemini Parsed Intent:', parsedIntent);
    } catch (error) {
      console.error('Gemini API Error, falling back to regex parser:', error.message);
      parsedIntent = fallbackIntentParser(message);
    }
  } else {
    // Use regex parser for mock demo
    parsedIntent = fallbackIntentParser(message);
    console.log('Fallback/Mock Parsed Intent:', parsedIntent);
  }

  // Query database based on parsed intent
  try {
    let query = { isLive: true };

    if (parsedIntent.location) {
      query.address = { $regex: parsedIntent.location, $options: 'i' };
    }

    if (parsedIntent.connectorType) {
      query.connectorType = parsedIntent.connectorType;
    }

    if (parsedIntent.maxPrice) {
      query.pricePerKwh = { $lte: Number(parsedIntent.maxPrice) };
    }

    // Fetch the matching chargers
    let chargers = await Charger.find(query).limit(3).populate('merchantId', 'name email');

    // If no chargers found for specific filter, try relaxed filter (just location or general)
    if (chargers.length === 0 && parsedIntent.location) {
      chargers = await Charger.find({ 
        isLive: true, 
        address: { $regex: parsedIntent.location, $options: 'i' } 
      }).limit(3).populate('merchantId', 'name email');
    }

    // If still none, return any 3 live chargers
    if (chargers.length === 0) {
      chargers = await Charger.find({ isLive: true }).limit(3).populate('merchantId', 'name email');
    }

    res.json({
      intent: parsedIntent,
      chargers,
      message: parsedIntent.location 
        ? `Here are some EV chargers matching your request near ${parsedIntent.location}.` 
        : `Here are some active chargers that might fit your criteria.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
