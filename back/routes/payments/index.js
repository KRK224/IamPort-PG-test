const express = require('express');
const completePayment = require('./complete');
const cancelPayment = require('./cancel');

const router = express.Router();

router.post('/complete', completePayment);
router.post('/cancel', cancelPayment);

module.exports = router;
