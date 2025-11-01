const express = require("express");
const devicesRouter = require("./devices");
const deviceSavingsRouter = require("./deviceSavings");
const deviceStatsRouter = require("./deviceStats");
const healthRouter = require("./health");

const router = express.Router();

// Note: Multiple routers are mounted at /devices path intentionally
// Express will try each router in order, allowing for modular organization:
// - devicesRouter handles: GET / and GET /:id
// - deviceSavingsRouter handles: GET /:id/savings and GET /:id/savings/aggregated
// - deviceStatsRouter handles: GET /:id/stats/monthly
router.use("/devices", devicesRouter);
router.use("/devices", deviceSavingsRouter);
router.use("/devices", deviceStatsRouter);
router.use("/health", healthRouter);

module.exports = router;
