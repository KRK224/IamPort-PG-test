const express = require('express');
const issueBilling = require('./issueBilling');

const router = express.Router();

router.post('/issue-billing', issueBilling);

module.exports = router;
