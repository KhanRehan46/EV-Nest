import express from 'express';
import Charger from '../models/User.js'; // Wait, let's import the actual Charger model!
import ChargerModel from '../models/Charger.js';
import { protect, merchantOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all live chargers
// @route   GET /api/chargers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const chargers = await ChargerModel.find({ isLive: true }).populate('merchantId', 'name email');
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search/filter chargers
// @route   GET /api/chargers/search
// @access  Public
router.get('/search', async (req, res) => {
  const { location, maxPrice, connectorType, minSpeed } = req.query;

  let query = { isLive: true };

  // Filter by location (address search via regex)
  if (location) {
    query.address = { $regex: location, $options: 'i' };
  }

  // Filter by connector type
  if (connectorType) {
    query.connectorType = connectorType;
  }

  // Filter by max price
  if (maxPrice) {
    query.pricePerKwh = { $lte: Number(maxPrice) };
  }

  // Filter by min speed
  if (minSpeed) {
    query.speedKw = { $gte: Number(minSpeed) };
  }

  try {
    const chargers = await ChargerModel.find(query).populate('merchantId', 'name email');
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single charger details
// @route   GET /api/chargers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const charger = await ChargerModel.findById(req.params.id).populate('merchantId', 'name email');
    if (charger) {
      res.json(charger);
    } else {
      res.status(404).json({ message: 'Charger not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a charger listing
// @route   POST /api/chargers
// @access  Private/Merchant
router.post('/', protect, merchantOnly, async (req, res) => {
  const { title, description, address, lat, lng, connectorType, speedKw, pricePerKwh, markupPercent, photos } = req.body;

  try {
    const charger = new ChargerModel({
      merchantId: req.user._id,
      title,
      description,
      address,
      lat: Number(lat),
      lng: Number(lng),
      connectorType,
      speedKw: Number(speedKw),
      pricePerKwh: Number(pricePerKwh),
      markupPercent: Number(markupPercent || 0),
      photos: photos || ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
      isLive: true,
    });

    const createdCharger = await charger.save();
    res.status(201).json(createdCharger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a charger listing
// @route   PUT /api/chargers/:id
// @access  Private/Merchant
router.put('/:id', protect, merchantOnly, async (req, res) => {
  const { title, description, address, lat, lng, connectorType, speedKw, pricePerKwh, markupPercent, photos } = req.body;

  try {
    const charger = await ChargerModel.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Check ownership
    if (charger.merchantId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    charger.title = title || charger.title;
    charger.description = description !== undefined ? description : charger.description;
    charger.address = address || charger.address;
    charger.lat = lat !== undefined ? Number(lat) : charger.lat;
    charger.lng = lng !== undefined ? Number(lng) : charger.lng;
    charger.connectorType = connectorType || charger.connectorType;
    charger.speedKw = speedKw !== undefined ? Number(speedKw) : charger.speedKw;
    charger.pricePerKwh = pricePerKwh !== undefined ? Number(pricePerKwh) : charger.pricePerKwh;
    charger.markupPercent = markupPercent !== undefined ? Number(markupPercent) : charger.markupPercent;
    charger.photos = photos || charger.photos;

    const updatedCharger = await charger.save();
    res.json(updatedCharger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Toggle charger live status
// @route   PATCH /api/chargers/:id/toggle
// @access  Private/Merchant
router.patch('/:id/toggle', protect, merchantOnly, async (req, res) => {
  try {
    const charger = await ChargerModel.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Check ownership
    if (charger.merchantId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    charger.isLive = !charger.isLive;
    const updatedCharger = await charger.save();
    res.json(updatedCharger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a charger listing
// @route   DELETE /api/chargers/:id
// @access  Private/Merchant
router.delete('/:id', protect, merchantOnly, async (req, res) => {
  try {
    const charger = await ChargerModel.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Check ownership
    if (charger.merchantId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await ChargerModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charger removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
