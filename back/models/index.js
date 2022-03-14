const Sequelize = require('sequelize');
const CustomerInfo = require('./customer');
const OrderInfo = require('./order');
// const BuyerInfo = require('./buyer');

const env = process.env.Node_ENV || 'development';
const config = require('../config/config')[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.CustomerInfo = CustomerInfo;
db.OrderInfo = OrderInfo;
// db.BuyerInfo = BuyerInfo;

CustomerInfo.init(sequelize);
OrderInfo.init(sequelize);
// BuyerInfo.init(sequelize);

CustomerInfo.associate(db);
OrderInfo.associate(db);
// BuyerInfo.associate(db);

module.exports = db;