function get_style_for_table() {
    return '<style> \
      table{\
          width: 100% \
          margin: 40px 0 0 0;\
          text-align: left;\
          border-collapse: separate;\
          border: 1px solid #ddd;\
          border-spacing: 10px;\
          border-radius: 3px;\
          background: #fdfdfd;\
          width: auto;\
        }\
        td,th{\
          border: 1px solid #ddd;\
          padding: 5px;\
          border-radius: 3px;\
          font-size: 20px;\
        }</style>';
}

function get_json_indexer() {
    return ["bik", "email", "accountNumber", "inn", 
    "nds", "price", "telephone"];
}

function create_table(mas) {
    var ans = "<h1>Запрошенные платежи</h1>\
    <table>";
    var index;
    var jsonIndexer = get_json_indexer();

    ans += "<tr>";
    for (val of jsonIndexer) {
        ans += "<td>";
        ans += val;
        ans += "</td>";
    }
    ans += "</tr>";
    for (index = 0; index < mas.length; index++) {
        var subans = "<tr>";
        for (val of jsonIndexer) {
            subans += "<td>";
            subans += mas[index][val];
            subans += "</td>";
        }
        subans += "</tr>";

        ans += subans;
    }

    ans += "</table>"
    return get_style_for_table() + ans;
}

function cmp(sort, a, b) {
    if (sort == "desc") {
        return a < b;
    }
    else {
        return a > b;
    }
}

function sort_by_field(mas, sort, field) {
    var i, j;
    if (get_json_indexer().indexOf(field) == -1)
        return mas;
    for (i = 0; i < mas.length; i++) {
        for (j = 0; j < mas.length - i - 1; j++) {
            if (cmp(sort, mas[j][field], mas[j + 1][field])) {
                var temp = mas[j];
                mas[j] = mas[j + 1];
                mas[j + 1] = temp;
            }
        }
    }
    return mas;
}

function filter_by_filter(mas, field, filter) {
    result_mas = [];
    console.log(typeof(field))
    if (get_json_indexer().indexOf(field) == -1)
        return [];
    for (val of mas) {
        if (val[field] == filter) {
            result_mas.push(val);
        }
    }
    return result_mas;
}

var express = require('express');
var router = express.Router();

const MongoClient = require("mongodb").MongoClient;

/*Get all payment by card*/
router.get('/', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers",  
        "Origin, Content-Type, X-Auth-Token , Authorization");
    
    let sort = req.query.sort;
    let field = req.query.field;
    let filter = req.query.filter;

    const collection = req.app.locals.collection1;
    collection.find({}).toArray(function(err, users){
        if(err) 
            return console.log(err);

        array_with_data = users
        if (sort && field)
            array_with_data = sort_by_field(array_with_data, sort, field);
        
        if (filter && field)
            array_with_data = filter_by_filter(array_with_data, field, filter);
        
        res.send(create_table(array_with_data))
    });
});

router.options('/', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
});

router.post('/', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if(!req.body) 
        return res.sendStatus(400);

    data = JSON.parse(Object.keys(req.body)[0]);
    const collection = req.app.locals.collection1;
    collection.insertOne(data, function(err, result){
        if(err) 
            return console.log(err);
    });

    res.send("Платеж оработан");
});

module.exports = router;
