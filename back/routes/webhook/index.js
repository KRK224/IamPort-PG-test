const express = require('express');
const webhookPayment = require('./webhookPayment');
const webhookSchedule = require('./webhookSchedule');

const router = express.Router();

router.post('/', webhookPayment);
router.post('/schedule', webhookSchedule);

module.exports = router;
