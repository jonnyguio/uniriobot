const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello world!');
});

const verifyToken = process.env.VERIFYTOKEN;
const pageToken = process.env.PAGETOKEN;
if(!verifyToken) {
    console.error('Verify Token env variable not set');
    exit(1);
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

app.get('/webhook', (req, res) => {
    if(req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge']);
    }

    res.send('Error, wrong token.');
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id
	    if (event.message && event.message.text) {
		    let text = event.message.text
		    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
	    }
    }
    res.sendStatus(200)
})

app.listen(app.get('port'), () => {
    console.log('Bot started at port: ' + app.get('port'));
});