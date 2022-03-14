const express = require('express');
const register = require('./register');
const info = require('./info');

const router = express.Router();

router.post('/register', register);
router.post('/info', info);

module.exports = router;
