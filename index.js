const express = require('express');
const bodyParser = require('body-parser');
const csvToJson = require('csvtojson');
const https = require('https');

const receiveHandler = require('./receiver');
const sendHandler = require('./sender');
const app = express();

var consign = require('consign');
 
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

consign()
  .include('routes')
  .into(app);

app.listen(app.get('port'), () => {
    console.log('Bot started at port: ' + app.get('port'));
});