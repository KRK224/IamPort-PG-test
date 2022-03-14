const configfile = require('./config.json');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  'development' : {
    ...configfile.development,
    password: process.env.DB_PASSWORD
  }
}

module.exports = config;