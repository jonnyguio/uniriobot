const express = require('express');
const bodyParser = require('body-parser');

const receiveHandler = require('./receiver');
const sendHandler = require('./sender')

const app = express();

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello world!');
});

const verifyToken = process.env.VERIFYTOKEN;

if(!verifyToken) {
    console.error('Verify Token env variable not set');
    exit(1);
}

app.get('/webhook', (req, res) => {
    if(req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge']);
    }

    res.send('Error, wrong token.');
});

app.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.message) {
                    receiveHandler.receivedMessage(event);
                } 
                else if (event.postback) {
                    receiveHandler.receivedPostback(event);
                }
                else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
});

app.listen(app.get('port'), () => {
    console.log('Bot started at port: ' + app.get('port'));
});