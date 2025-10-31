const express = require('express');
const { getDevices, getDeviceSavings } = require('../utils/dataLoader');

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    devices_loaded: getDevices().length,
    savings_records: getDeviceSavings().length
  });
});

module.exports = router;