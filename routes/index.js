const express = require('express');
const healthRouter = require('./health');
const devicesRouter = require("./devices");

const router = express.Router();

// Mount route modules
router.use('/health', healthRouter);
router.use("/devices", devicesRouter);


module.exports = router;