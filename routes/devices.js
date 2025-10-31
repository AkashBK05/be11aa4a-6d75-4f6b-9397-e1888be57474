const express = require('express');
const { getDevices, getDeviceById } = require('../utils/dataLoader');

const router = express.Router();

// Get all devices
router.get('/', (req, res) => {
  res.json(getDevices());
});

// Get device by ID
router.get('/:id', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const device = getDeviceById(deviceId);

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json(device);
});

module.exports = router;