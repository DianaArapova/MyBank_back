var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('<style>\
  a {\
   font-size: 19pt; \
  }\
 </style>\
  <h1>It is admin panel for Diana' + "'" + 's bank</h1>\
  <div><a href="http://localhost:3000/payment"> Запрошенные платежи </a> </div> \
  <div><a href="http://localhost:3000/card-payment"> Платежи, оплаченные картой</a> </div>' );
});

module.exports = router;
