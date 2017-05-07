const sendHandler = require('./sender');
const csv = require('csvtojson');
const request = require('request');

const DOWS_NAMES = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sábado",
    6: "Sábado"
}

function getMenu(senderID, day, turn) {
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
        var sendString = ''
        if (turn === 'almoco') {
            sendString += 'Prato principal:' + result[2][day] + '\n';
            sendString += 'Prato vegetariano:' + result[3][day] + '\n';
            sendString += 'Guarnição:' + result[4][day] + '\n';
            sendString += 'Arroz branco, feijão preto, arroz integral:' + result[5][day] + '\n';
            sendString += 'Vegetal folhoso:' + result[7][day] + '\n';
            sendString += 'Vegetal não-folhoso:' + result[8][day] + '\n';
            sendString += 'Refresco:' + result[9][day] + '\n';
            // console.log(result[j][day]);

            if (sendString.toLocaleLowerCase().includes('feriado'))
                sendString = DOWS_NAMES[day] + ' é feriado, não funcionará o bandejão.';
        }
        else if (turn === 'jantar') {
            sendString += 'Prato principal:' + result[12][day] + '\n';
            sendString += 'Prato vegetariano:' + result[13][day] + '\n';
            sendString += 'Guarnição:' + result[14][day] + '\n';
            sendString += 'Arroz branco, feijão preto, arroz integral:' + result[15][day] + '\n';
            sendString += 'Vegetal folhoso:' + result[17][day] + '\n';
            sendString += 'Vegetal não-folhoso:' + result[18][day] + '\n';
            sendString += 'Refresco:' + result[19][day] + '\n';
            // for (var j = 12; j < 20; j++)
                // console.log(result[j][day]);
            if (sendString.toLocaleLowerCase().includes('feriado'))
                sendString = DOWS_NAMES[day] + ' é feriado, não funcionará o bandejão.';
        }
        else if (day == 'semana') {
            for (var k = 1; k < 6; k++) {
                sendString += DOWS_NAMES[k] + '\n';
                sendString += 'ALMOÇO\n';
                sendString += 'Prato principal:' + result[2][k] + '\n';
                sendString += 'Prato vegetariano:' + result[3][k] + '\n';
                sendString += 'Guarnição:' + result[4][k] + '\n';
                sendString += 'Arroz branco, feijão preto, arroz integral:' + result[5][k] + '\n';
                sendString += 'Vegetal folhoso:' + result[7][k] + '\n';
                sendString += 'Vegetal não-folhoso:' + result[8][k] + '\n';
                sendString += 'Refresco:' + result[9][k] + '\n';
                sendString += 'JANTAR\n';
                sendString += 'Prato principal:' + result[12][k] + '\n';
                sendString += 'Prato vegetariano:' + result[13][k] + '\n';
                sendString += 'Guarnição:' + result[14][k] + '\n';
                sendString += 'Arroz branco, feijão preto, arroz integral:' + result[15][k] + '\n';
                sendString += 'Vegetal folhoso:' + result[17][k] + '\n';
                sendString += 'Vegetal não-folhoso:' + result[18][k] + '\n';
                sendString += 'Refresco:' + result[19][k] + '\n';
                sendHandler.sendTextMessage(senderID, sendString);
                sendString = '';
            }
        }

        sendHandler.sendTextMessage(senderID, sendString);
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
                getMenu(senderID, dow, 'almoço');
            getMenu(senderID, dow, 'jantar');
            sendHandler.sendTextMessage(senderID, "Você pediu o cardápio de hoje");
            // sendHandler.sendTodayMessage(SenderID, timeOfPostback);
            break;
        case 'button-cardapio-amanha':
            getMenu(senderID, dow + 1, 'almoço');
            getMenu(senderID, dow + 1, 'jantar');
            sendHandler.sendTextMessage(senderID, "Você pediu o cardápio de amanhã");
            break;
        case 'button-cardapio-semana':
            getMenu(senderID, 'semana');
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