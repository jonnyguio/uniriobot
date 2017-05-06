const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello');
});

var verifyToken = process.env.VERIFYTOKEN;
if(!verifyToken) {
    console.error('Verify Token env variable not set');
    exit(1);
}

app.get('/webhook', (req, res) => {
    if(req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge']);
    }

    res.send('Error, wrong token');
});

app.listen(app.get('port'), () => {
    console.log('Bot started at port: ' + app.get('port'));
});