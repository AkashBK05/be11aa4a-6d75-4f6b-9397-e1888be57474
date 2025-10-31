const fs = require("fs");
const csv = require("csv-parser");

// In-memory data storage
let devices = [];
let deviceSavings = [];

// Load CSV data on startup
async function loadData() {
  console.log("Loading data...");

  // Clear existing data to avoid duplication on repeated loads
  devices.length = 0;
  deviceSavings.length = 0;

  // Load devices
  return new Promise((resolve, reject) => {
    fs.createReadStream("./data/devices.csv")
      .pipe(csv())
      .on("data", (row) => {
          const id = parseInt(row.id);
          if (isNaN(id)) {
            console.warn(`Skipping device with invalid id: ${row.id}`);
            return;
          }

        devices.push({
          id: parseInt(row.id),
          name: row.name,
          timezone: row.timezone,
        });
      })
      .on("end", () => {
        console.log(`Loaded ${devices.length} devices`);

        // Load device savings
        fs.createReadStream("./data/device-saving.csv")
          .pipe(csv())
          .on("data", (row) => {
            deviceSavings.push({
              device_id: parseInt(row.device_id),
              timestamp: new Date(row.timestamp),
              device_timestamp: new Date(row.device_timestamp),
              carbon_saved: parseFloat(row.carbon_saved),
              fuel_saved: parseFloat(row.fueld_saved),
            });
          })
          .on("end", () => {
            console.log(`Loaded ${deviceSavings.length} device saving records`);
            resolve();
          })
          .on("error", reject);
      })
      .on("error", reject);
  });
}

function getDevices() {
  return [...devices]; 
}

function getDeviceSavings() {
  return [...deviceSavings]; 
}

function getDeviceById(id) {
  const device = devices.find((d) => d.id === id);
  return device ? { ...device } : undefined; 
}

function getDeviceSavingsById(deviceId) {
  return deviceSavings
    .filter((s) => s.device_id === deviceId)
    .map((saving) => ({ ...saving })); 
}

module.exports = {
  loadData,
  getDevices,
  getDeviceSavings,
  getDeviceById,
  getDeviceSavingsById,
};
