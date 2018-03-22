const dotenv = require('dotenv');

dotenv.load({ path: `.env.${process.env.NODE_ENV || 'development'}` });

module.exports = require('./api/server');
