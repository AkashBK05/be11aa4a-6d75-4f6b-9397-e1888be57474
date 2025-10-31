const express = require("express");
const cors = require("cors");
const path = require("path");
const { loadData } = require("./utils/dataLoader");
const apiRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API Routes
app.use("/api", apiRoutes);



// Start server
async function startServer() {
  try {
    await loadData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API endpoints:`);
      console.log(`  GET /api/health - Health check`);
      console.log(`  GET /api/devices - List all devices`);
      console.log(`  GET /api/devices/:id - Get device details`);
      console.log(`  GET /api/devices/:id/savings - Get device savings data`);
      console.log(`  GET /api/devices/:id/savings/aggregated - Get aggregated savings data`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
