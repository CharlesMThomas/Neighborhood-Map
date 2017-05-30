var express = require('express');
var request = require("request");
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/'));

app.post('/business/search', function(req, res) {

    var options = { method: 'GET',
    url: 'https://api.yelp.com/v3/businesses/search',
    qs: 
    { latitude: req.body.latitude,
        longitude: req.body.longitude,
        radius: '1600',
        term: req.body.name
    },
    headers: 
    { 'postman-token': 'a37c5299-b543-dccc-fe5f-330c126c7aa2',
        'cache-control': 'no-cache',
        authorization: 'Bearer F2lc_Whp97Ot2Q6wQSQdcV-ZVOaspUSiLtuHqM0MRmktA5MozvpsI7WD-FrGkTlp95XsSeygbCkyTxl1ApYdzKoIvXijSLUCEos1c7n-myKN-LT_G5VHw11X9SH9WHYx' } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    res.send(body);
    });

});

app.post('/business/reviews', function(req, res) {

    var review_url = 'https://api.yelp.com/v3/businesses/' + req.body.id + '/reviews';

    var options = { method: 'GET',
    url: review_url,
    headers: 
    { 'postman-token': 'a37c5299-b543-dccc-fe5f-330c126c7aa2',
        'cache-control': 'no-cache',
        authorization: 'Bearer F2lc_Whp97Ot2Q6wQSQdcV-ZVOaspUSiLtuHqM0MRmktA5MozvpsI7WD-FrGkTlp95XsSeygbCkyTxl1ApYdzKoIvXijSLUCEos1c7n-myKN-LT_G5VHw11X9SH9WHYx' } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    res.send(body);
    });

});

app.listen(process.env.PORT || 8080);