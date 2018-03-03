const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const boom = require('express-boom');
const logger = require('morgan');
const { errors } = require('celebrate');
const config = require('../package.json');
const userRoute = require('./routes/users');


const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

app.use(logger('dev'));
app.set('port', process.env.PORT);
app.use(compression());
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(boom());

app.get('/version', (req, res) => res.send({ name: config.name, version: config.version }));
app.use('/users', userRoute);
app.use(errors());
app.use((req, res) => {
  res.boom.notFound();
});
app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});
