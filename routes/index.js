const express = require('express');
const healthRouter = require('./health');
const devicesRouter = require('./devices');
const deviceSavingsRouter = require('./deviceSavings');

const router = express.Router();

// Mount route modules
router.use('/health', healthRouter);
router.use('/devices', devicesRouter);
router.use('/devices', deviceSavingsRouter);

module.exports = router;