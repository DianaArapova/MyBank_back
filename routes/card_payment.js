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
          font-size: 20px; } \
        .notsafe {background-color: red;}\
        </style>';
}

function get_json_indexer() {
    return ["cardNumber", "sum", "mm", "gg", "cvc", 
    "fio", "comment", "email"];
}

function get_script() {
    return '<script>\
                function onLoad(id, isSafe) {\
                var x=new XMLHttpRequest();\
                x.addEventListener("load", function () {\
                    console.log(this.responseText);\
                });\
                x.open("PATCH", \
                "http://localhost:3000/card-payment/" + id + "/" +isSafe, false);\
                x.send({isSafe:"false"});\
                if (x.status == 200) {\
                    alert( x.responseText + ". Обновите старницу!"); \
                  }}\
            </script>'
}

function get_button_html(id, isSafe) {
    var safe = "false";
    if (isSafe)
        safe = "true";
    return '<p><button onclick="onLoad('+ "'" +id +"'," +
     "'" + isSafe + "'" +')">Изменить безопасность </button></p>';
}

function create_table(mas) {
    var ans = "<h1>Платежи, оплаченные картой</h1><table>";
    var index;
    var jsonIndexer = get_json_indexer();

    ans += "<tr>";
    for (val of jsonIndexer) {
        ans += "<td>";
        ans += val;
        ans += "</td>";
    }
    ans += "<td>";
    ans += "Пометить платеж небезопасным";
    ans += "</td>";

    ans += "</tr>";
    for (index = 0; index < mas.length; index++) {
        var subans = "<tr>";
        if (mas[index]['safe']) {
            subans = "<tr class='notsafe'>";
        }
        for (val of jsonIndexer) {
            subans += "<td>";
            subans += mas[index][val];
            subans += "</td>";
        }
        subans += "<td align=center>";
        subans += get_button_html(mas[index]['_id'], !mas[index]['safe']);
        subans += "</td>";
        subans += "</tr>";

        ans += subans;
    }
    
    
    ans += "</table>"
    return "<head>" + get_script() + get_style_for_table() + "</head>" 
    + "<body>" + ans + "</body>";
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
var mongo = require('mongodb');

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

    const collection = req.app.locals.collection;
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
    data.safe = false;

    const collection = req.app.locals.collection;
    collection.insertOne(data, function(err, result){
        if(err) 
            return console.log(err);
    });

    res.send("Запрос по оплате картой обработан");
});

router.patch('/:id/:isSafe', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if(!req.body) 
        return res.sendStatus(400);
    var isSafe = true;
    console.log("!!!")
    console.log(req.params);
    if (req.params.isSafe == "false")
        isSafe = false;
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate(
        {_id: new mongo.ObjectID((req.params.id))},
        { $set: {safe: isSafe}}, 
        function(err, result){
                    
            console.log(result);
        }
    );
    res.send("PATCH запрос обработан");
});

module.exports = router;
