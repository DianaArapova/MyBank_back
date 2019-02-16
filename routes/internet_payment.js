function gererate_gaps(count) {
    var str = "";
    var i;
    for (i = 0; i < count; i++) {
        str += " ";
    }
    return str;
}

function generate_file(jsonData) {
    var line = " ----------------------------------"
    var ans = line + "\n"
    var subans = "|Сумма: " + jsonData["price"]
    ans += subans + gererate_gaps(line.length - subans.length) + "|\n";
    
    subans = "|ИНН: " + jsonData["inn"]
    ans +=  subans + gererate_gaps(line.length - subans.length) + "|\n";

    subans = "|БИК: " + jsonData["bik"]
    ans +=  subans + gererate_gaps(line.length - subans.length) + "|\n";

    subans = "|Номер счета: " + jsonData["accountNumber"]
    ans +=  subans + gererate_gaps(line.length - subans.length) + "|\n";

    subans = "|НДС: " + jsonData["nds"]
    ans +=  subans + gererate_gaps(line.length - subans.length) + "|\n";
    return ans + line + "\n";
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
    
    var fileName = __dirname + "\\payment1.txt"; 

    res.download(fileName);
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
    console.log("data: " + JSON.stringify(data));



    const fs = require('fs');
        fs.writeFileSync(__dirname + "\\payment1.txt", generate_file(data), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    var fileName = __dirname + "\\payment1.txt"; 

    res.sendFile(fileName);
});

module.exports = router;
