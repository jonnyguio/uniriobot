
const sendHandler = require('./sender')
const removeAccents = require('diacritics').remove;
const removePunctuation = require('remove-punctuation');
const csv = require('csvtojson');
const request = require('request');

const DOWS_NAMES = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado"
}

function formatSendMenu(data, day, turn) {
    var send = '';
    var meal = turn + 2;
    console.log(data[meal][day]);
    console.log(data[meal]);
    console.log(meal);
    console.log(day);
    send += 'Prato principal:' + data[meal][day] + '\n';
    send += 'Prato vegetariano:' + data[meal][day] + '\n';
    send += 'Guarnição:' + data[meal][day] + '\n';
    send += 'Arroz branco, feijão preto, arroz integral:' + data[meal][day] + '\n';
    send += 'Vegetal folhoso:' + data[meal][day] + '\n';
    send += 'Vegetal não-folhoso:' + data[meal][day] + '\n';
    send += 'Refresco:' + data[meal][day] + '\n';
    return send;
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
            // console.log(result[j][day]);
            sendString = formatSendMenu(result, day, 0);
            if (sendString.toLocaleLowerCase().includes('feriado'))
                sendString = DOWS_NAMES[day] + ' é feriado, não funcionará o bandejão.';
        }
        else if (turn === 'jantar') {
            sendString = formatSendMenu(result, day, 10);
            if (sendString.toLocaleLowerCase().includes('feriado'))
                sendString = DOWS_NAMES[day] + ' é feriado, não funcionará o bandejão.';
        }
        else if (day == 'semana') {
            for (var k = 1; k < 6; k++) {
                sendString += DOWS_NAMES[k] + '\n';
                sendString += '\nALMOÇO\n\n';
                sendString += formatSendMenu(result, day, 0);
                sendString += '\nJANTAR\n\n';
                sendString += formatSendMenu(result, day, 10);
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
        if (checkCardapio(messageText)) {
            sendHandler.sendMenuMessage(senderID, messageText, timeOfMessage);
        }
        else if (checkInicioCalendarioAcademico(messageText)) {
            sendHandler.sendTextMessage(senderID, "Calendário");
        }
        

        // switch (messageText) {
        //     case 'generic':
        //         sendHandler.sendGenericMessage(senderID);
        //         break;
            
        //     case 'cardapio':
        //         sendHandler.sendMenuMessage(senderID, messageText, timeOfMessage);
        //         break;

        //     default:
        //         sendHandler.sendTextMessage(senderID, messageText);
        // }
    } else if (messageAttachments) {
        sendHandler.sendTextMessage(senderID, "Message with attachment received");
    }
}

module.exports = {
    receivedMessage: receivedMessage,
    receivedPostback: receivedPostback
}

function checkCardapio(msg) {
    return msg.includes('cardapio');
}

function checkInicioCalendarioAcademico(msg) {
    return containsTokens(msg, 'calendario', 'academico');
}

function containsTokens(str, ...tokens) {
    str = removePunctuation(removeAccents(str.toLowerCase()));
    words = str.split(' ');
    for(tok of tokens) {
        if(!(words.includes(tok.toLowerCase())))
            return false;
    }

    return true;
}