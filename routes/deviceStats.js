const express = require('express');
const { getDeviceById, getDeviceSavingsById } = require('../utils/dataLoader');

const router = express.Router();

// Get monthly statistics for a device (average per month)
 router.get('/:id/stats/monthly', (req, res) => {
  try {
     const deviceId = parseInt(req.params.id);
    if (isNaN(deviceId) || deviceId <= 0) {
      return res.status(400).json({ error: 'Invalid device ID' });
    }

     const device = getDeviceById(deviceId);
     if (!device) {
         return res.status(404).json({ error: 'Device not found' });
     }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

    const deviceData = getDeviceSavingsById(deviceId);

    if (deviceData.length === 0) {
        return res.json({ carbon_saved: 0, fuel_saved: 0 });
    }

    // Group data by month to calculate average
    const monthlyGroups = {};

    deviceData.forEach(item => {
        const itemDate = new Date(item.device_timestamp);
        const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;

        if (!monthlyGroups[monthKey]) {
            monthlyGroups[monthKey] = {
                carbon_saved: 0,
                fuel_saved: 0,
                count: 0,
                date: itemDate
            };
        }

        monthlyGroups[monthKey].carbon_saved += item.carbon_saved;
        monthlyGroups[monthKey].fuel_saved += item.fuel_saved;
        monthlyGroups[monthKey].count += 1;
    });

    // Calculate average across all months
    const monthlyTotals = Object.values(monthlyGroups);
    const totalMonths = monthlyTotals.length;

    const averageStats = monthlyTotals.reduce((acc, month) => ({
        carbon_saved: acc.carbon_saved + month.carbon_saved,
        fuel_saved: acc.fuel_saved + month.fuel_saved
    }), { carbon_saved: 0, fuel_saved: 0 });

    res.json({
        carbon_saved: averageStats.carbon_saved / totalMonths,
        fuel_saved: averageStats.fuel_saved / totalMonths,
        months_count: totalMonths
    });
});

module.exports = router;