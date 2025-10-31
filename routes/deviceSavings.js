const express = require('express');
const moment = require('moment-timezone');
const { getDeviceById, getDeviceSavingsById } = require('../utils/dataLoader');

const router = express.Router();

// Get device savings with optional date filtering
router.get('/:id/savings', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const { start_date, end_date, timezone } = req.query;

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  let filteredSavings = getDeviceSavingsById(deviceId);

  // Apply date filtering if provided
  if (start_date || end_date) {
    const deviceTimezone = timezone || device.timezone;

    if (start_date) {
      const startMoment = moment.tz(start_date, deviceTimezone);
      filteredSavings = filteredSavings.filter(s =>
        moment(s.device_timestamp).isAfter(startMoment)
      );
    }

    if (end_date) {
      const endMoment = moment.tz(end_date, deviceTimezone);
      filteredSavings = filteredSavings.filter(s =>
        moment(s.device_timestamp).isBefore(endMoment)
      );
    }
  }


  filteredSavings.sort((a, b) => a.device_timestamp - b.device_timestamp);

  res.json({
    device: device,
    data: filteredSavings,
    total_records: filteredSavings.length
  });
});

// Get aggregated savings data for charting
router.get('/:id/savings/aggregated', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const { start_date, end_date, interval = 'hour', timezone } = req.query;

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  let filteredSavings = getDeviceSavingsById(deviceId);

  // Apply date filtering
  if (start_date || end_date) {
    const deviceTimezone = timezone || device.timezone;

    if (start_date) {
      const startMoment = moment.tz(start_date, deviceTimezone);
      filteredSavings = filteredSavings.filter(s =>
        moment(s.device_timestamp).isAfter(startMoment)
      );
    }

    if (end_date) {
      const endMoment = moment.tz(end_date, deviceTimezone);
      filteredSavings = filteredSavings.filter(s =>
        moment(s.device_timestamp).isBefore(endMoment)
      );
    }
  }

  // Group by interval (hour, day, etc.)
  const grouped = {};
  const deviceTimezone = timezone || device.timezone;

  filteredSavings.forEach(saving => {
    let key;
    const momentTime = moment(saving.device_timestamp).tz(deviceTimezone);

    switch (interval) {
      case 'hour':
        key = momentTime.format('YYYY-MM-DD HH:00:00');
        break;
      case 'day':
        key = momentTime.format('YYYY-MM-DD');
        break;
      case 'month':
        key = momentTime.format('YYYY-MM-01'); 
        break;
      case 'raw':
      default:
        key = momentTime.format('YYYY-MM-DD HH:mm:ss');
        break;
    }

    if (!grouped[key]) {
      grouped[key] = {
        timestamp: key,
        carbon_saved: 0,
        fuel_saved: 0,
        count: 0
      };
    }

    grouped[key].carbon_saved += saving.carbon_saved;
    grouped[key].fuel_saved += saving.fuel_saved;
    grouped[key].count += 1;
  });

  // Convert to array - use sums for aggregated intervals to show total savings per period
  const result = Object.values(grouped).map(group => ({
    timestamp: group.timestamp,
    carbon_saved: group.carbon_saved, 
    fuel_saved: group.fuel_saved, 
    count: group.count
  }));

  // Sort by timestamp
  result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.json({
    device: device,
    interval: interval,
    data: result,
    total_records: result.length
  });
});

module.exports = router;