const express = require("express");
const moment = require("moment-timezone");
const { getDeviceById, getDeviceSavingsById } = require("../utils/dataLoader");

const router = express.Router();

// Helper function to apply date filtering with boundary inclusion
function applyDateFilter(savings, startDate, endDate, timezone) {
  if (!startDate && !endDate) {
    return savings;
  }

  // Validate dates if provided
  if (startDate && !moment.tz(startDate, timezone).isValid()) {
    throw new Error("Invalid start_date format");
  }
  if (endDate && !moment.tz(endDate, timezone).isValid()) {
    throw new Error("Invalid end_date format");
  }

  // Validate logical ordering
  if (startDate && endDate) {
    const start = moment.tz(startDate, timezone);
    const end = moment.tz(endDate, timezone);
    if (start.isAfter(end)) {
      throw new Error("start_date must be before or equal to end_date");
    }
  }

  let filtered = savings;

    if (startDate || endDate) {
      const startMoment = startDate ? moment.tz(startDate, timezone) : null;
      const endMoment = endDate ? moment.tz(endDate, timezone) : null;

      filtered = filtered.filter((s) => {
        const timestamp = moment(s.device_timestamp).tz(timezone);
        if (startMoment && timestamp.isBefore(startMoment)) return false;
        if (endMoment && timestamp.isAfter(endMoment)) return false;
        return true;
      });
    }

  return filtered;
}

// Get device savings with optional date filtering
router.get("/:id/savings", (req, res) => {
  const deviceId = parseInt(req.params.id);
  if (isNaN(deviceId) || deviceId <= 0) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  const { start_date, end_date, timezone } = req.query;

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }

  let filteredSavings = getDeviceSavingsById(deviceId);

  // Apply date filtering if provided
  const deviceTimezone = timezone || device.timezone;
  filteredSavings = applyDateFilter(
    filteredSavings,
    start_date,
    end_date,
    deviceTimezone
  );

  // Sort by device timestamp
  filteredSavings.sort((a, b) => a.device_timestamp - b.device_timestamp);

  res.json({
    device: device,
    data: filteredSavings,
    total_records: filteredSavings.length,
  });
});

// Get aggregated savings data for charting
router.get("/:id/savings/aggregated", (req, res) => {
  const deviceId = parseInt(req.params.id);
  if (isNaN(deviceId) || deviceId <= 0) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  const { start_date, end_date, interval = "hour", timezone } = req.query;

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }

  let filteredSavings = getDeviceSavingsById(deviceId);

  // Apply date filtering
  const deviceTimezone = timezone || device.timezone;
  filteredSavings = applyDateFilter(
    filteredSavings,
    start_date,
    end_date,
    deviceTimezone
  );

  // Group by interval (hour, day, etc.)
  const grouped = {};

  filteredSavings.forEach((saving) => {
    let key;
    const momentTime = moment(saving.device_timestamp).tz(deviceTimezone);

    switch (interval) {
      case "hour":
        key = momentTime.format("YYYY-MM-DD HH:00:00");
        break;
      case "day":
        key = momentTime.format("YYYY-MM-DD");
        break;
      case "month":
        key = momentTime.format("YYYY-MM-01"); // Use first day of month for consistency
        break;
      case "raw":
      default:
        key = momentTime.format("YYYY-MM-DD HH:mm:ss");
        break;
    }

    if (!grouped[key]) {
      grouped[key] = {
        timestamp: key,
        carbon_saved: 0,
        fuel_saved: 0,
        count: 0,
      };
    }

    grouped[key].carbon_saved += saving.carbon_saved;
    grouped[key].fuel_saved += saving.fuel_saved;
    grouped[key].count += 1;
  });

  // Convert to array - use sums for aggregated intervals to show total savings per period
  const result = Object.values(grouped).map((group) => ({
    timestamp: group.timestamp,
    carbon_saved: group.carbon_saved, 
    fuel_saved: group.fuel_saved,
    count: group.count,
  }));

  // Sort by timestamp
  result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.json({
    device: device,
    interval: interval,
    data: result,
    total_records: result.length,
  });
});

module.exports = router;