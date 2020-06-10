const express = require('express')
const jsonexport = require('jsonexport');
const app = express()
const port = 3000
const fs = require('fs');
const bodyParser = require('body-parser')
const path = require('path');

// Load the full build.
var _ = require('lodash');

const json2csv = require('json2csv').parse;
var someObject = require('./orderHistoryData.json')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



//use default get api to export json data into csv.
app.get('/', (req, res) =>{
    const currentTimeStamp = new Date().toISOString().replace(/[\/\\:]/g, "_");
    const fileName = `/documents/orderResponse${currentTimeStamp}.csv`
    const filePath = path.join(__dirname + fileName);
    let csv; 

 
    function getDeepKeys(obj) {
        var keys = [];
        for(var key in obj) {
            keys.push(key);
            if(typeof obj[key] === "object" ) {
                key.replace(/$[^\d\.\,\s]+/, "")
                var subkeys = getDeepKeys(obj[key]);
                keys = keys.concat(subkeys.map(function(subkey) {
                    key.replace(/$[^\d\.\,\s]+/, "")
                    return key + "." + subkey;
                }));
            }
        }
        return keys;
    }

    var allKeys = getDeepKeys(someObject);

     try {
            csv = json2csv(someObject, allKeys);
        } catch (err) {
            return res.status(500).json({err});
        }
    
        fs.writeFile(filePath, csv, function (err) {
            if (err) {
                return res.json(err).status(500);
            }
            res.download(filePath);
            
        })
})

 
app.post('/exportOrders', (req, res) =>{
    
    const order = req.body.Orders;
    const exportType = req.body.exportType
    const currentTimeStamp = new Date().toISOString().replace(/[\/\\:]/g, "_");
    const fileName = `/documents/orderResponse.${exportType}`
    const filePath = path.join(__dirname + fileName);
    jsonexport(order, function(err, exportType){
        if (err) return console.error(err);
        console.log(exportType);
        fs.writeFile(filePath, exportType, function(err) {
            if(err) {
                res.send(err);
            }
        });
        res.send(`${fileName}`);
    });
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))