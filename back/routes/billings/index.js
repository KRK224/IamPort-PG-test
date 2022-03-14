const express = require('express');
const requestBilling = require('./requestBilling');
const requestPayBilling = require('./requestPayBilling');
const requestScheduleBilling = require('./requestScheduleBilling');

const router = express.Router();

router.post('/payment', requestPayBilling);
router.post('/', requestBilling);
router.post('/schedule', requestScheduleBilling);


module.exports = router;
