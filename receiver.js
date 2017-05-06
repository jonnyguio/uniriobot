const sendHandler = require('./sender');
const csv = require('csvtojson');
const request = require('request');

function getMenu(day, turn) {
    result = []
    var i = 0;
    csv()
    .fromStream(request.get('https://docs.google.com/spreadsheets/d/1bPcJ7WzXUbgnBrQTFFBOJWKP_WJPJpt0tICD0b6X-fQ/pub?gid=0&single=true&output=csv'))
    .on('csv',(csvRow)=>{
        // console.log(csvRow);
        // csvRow is an array 
        result[i] = csvRow;
        i++;
    })
    .on('done',(error)=>{
        if (turn === 'almoco') {
            for (var j = 2; j < 10; j++)
                console.log(result[j][day]);
        }
        else if (turn === 'jantar') {
            for (var j = 12; j < 20; j++)
                console.log(result[j][day]);
        }
        else if (day == 'semana') {
            for (var k = 1; k < 6; k++) {
                for (var j = 2; j < 10; j++) {
                        console.log(result[j][k]);
                }
            }
        }
    })

}

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback 
    // button for Structured Messages. 
    var payload = event.postback.payload;

    var d = new Date()
    var dow = d.getDay(); // 0 = sunday
    var hour = d.getHours();

    switch (payload) {
        case 'get-started':
            sendHandler.sendMenuMessage(senderID);
            break;
        case 'button-cardapio-hoje':
            if (hour < 15)
                getMenu(dow, 'almoço');
            getMenu(dow, 'jantar');
            sendHandler.sendTextMessage(senderID, "Você pediu o cardápio de hoje");
            break;
        case 'button-cardapio-amanha':
            getMenu(dow, 'almoço');
            getMenu(dow, 'jantar');
            sendHandler.sendTextMessage(senderID, "Você pediu o cardápio de amanhã");
            break;
        case 'button-cardapio-semana':
            getMenu('semana');
            sendHandler.sendTextMessage(senderID, "Você pediu o cardápio da semana");
            break;
        default:
            sendHandler.sendTextMessage(senderID, "Postback called");
    }

    console.log("Received postback for user %d and page %d with payload '%s' " + "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to 
    // let them know it was successful
}


function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    // console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'generic':
                sendHandler.sendGenericMessage(senderID);
                break;
            
            case 'cardapio':
                sendHandler.sendMenuMessage(senderID, messageText, timeOfMessage);
                break;

            default:
                sendHandler.sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendHandler.sendTextMessage(senderID, "Message with attachment received");
    }
}

module.exports = {
    receivedMessage: receivedMessage,
    receivedPostback: receivedPostback
}