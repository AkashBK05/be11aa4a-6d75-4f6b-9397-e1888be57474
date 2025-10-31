const express = require('express');
const healthRouter = require('./health');

const router = express.Router();

// Mount route modules
router.use('/health', healthRouter);


module.exports = router;