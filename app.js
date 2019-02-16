var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoClient = require("mongodb").MongoClient;

var indexRouter = require('./routes/index');
var cardPayment = require('./routes/card_payment');
var internetPayment = require('./routes/internet_payment');
var payment = require('./routes/payment');

var app = express();

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

mongoClient.connect(function(err, client){
  if(err) return console.log(err);
  dbClient = client;
  app.locals.collection = client.db("usersdb").collection("card_payment4");
  app.locals.collection1 = client.db("usersdb").collection("payment2");
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/card-payment', cardPayment);
app.use('/internet-payment', internetPayment);
app.use('/payment', payment);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

process.on("SIGINT", () => {
  dbClient.close();
  process.exit();
});

module.exports = app;
