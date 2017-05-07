const request = require('request');
const pg = require('pg');
const staticMessages = require('./messages.js');
const removePunctuation = require('remove-punctuation');
const removeAccents = require('diacritics').remove;
const pageToken = process.env.PAGETOKEN;

const API_UNIRIO_URL = 'http://sistemas.unirio.br/api_teste/'
const API_UNIRIO_KEY = '744b3341f5f629a9560992f42b086494d4cb0b7a1b56a77c08240b8be97c7cb7ff3342c7034f5172761239b2943253e3'
const TABELA_ALUNOS = 'V_ALUNOS_ATIVOS';
const TABELA_NOTAS = 'V_NOTAS_FINAIS_ALUNOS_DISCIPLINAS';


const DOWS = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,    
    SATURDAY: 6
}
pg.defaults.ssl = true;

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: pageToken },
        method: 'POST',
        json: messageData
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
        } 
        else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });  
}

function sendTextMessage(recipientId, messageText, elementID) {
    console.log(typeof(messageText));
    if (typeof(messageText) == 'string') {
        if (messageText.length > 0) {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: messageText
                }
            };

            callSendAPI(messageData);
        }
    }
    else if (typeof(messageText) == 'object' && elementID < messageText.length) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText[elementID]
            }
        };

        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: pageToken },
            method: 'POST',
            json: messageData
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
                sendTextMessage(recipientId, messageText, elementID + 1);
            } 
            else {
                console.error("Unable to send message.");
                console.error(response);
                console.error(error);
            }
        });  
    }
}

function sendGradeMessage(senderID) {
    var parsedBody, studentFName = '', studentLName = '', id_pessoa, ano;
    request.get('https://graph.facebook.com/v2.6/' + senderID + '?fields=first_name,last_name&access_token=' + pageToken,
        function (error, response, body) {
            parsedBody = JSON.parse(body);
            studentFName += parsedBody["first_name"];
            studentLName += parsedBody["last_name"];
            sendTextMessage(senderID, 'Recuperando as notas do ano atual...');
            request.get(API_UNIRIO_URL + TABELA_ALUNOS + '?API_KEY=' + API_UNIRIO_KEY, 
            function (err, res, body) {
                parsedBody = JSON.parse(body);
                parsedBody["content"].every(function(element) {
                    if (containsTokens(element["nome"], studentFName, studentLName)) {
                        console.log('achei o id: ' + element['id_pessoa'] + ', procurando notas do aluno...');
                        id_pessoa = element['id_pessoa'];
                        return false;
                    }
                    return true;
                }, this);
                if (!id_pessoa) {
                    id_pessoa = 14548
                    ano = 2009
                }
                else {
                    ano = (new Date()).getFullYear()
                }
                request.get(API_UNIRIO_URL + TABELA_NOTAS + '?API_KEY=' + API_UNIRIO_KEY + '&id_pessoa=' + id_pessoa + '&ano=2009',
                function (err, res, body) {
                    parsedBody = JSON.parse(body);
                    var sendString = []
                    var k = 0;
                    parsedBody["content"].forEach(function(element) {
                        if (element['media_final']) {
                            sendString[k] = element['nome_ativ_curric'].replace(/\s+/g, ' ').trim() + ', média: ' + element['media_final'];
                        }
                        else {
                            sendString[k] = element['nome_ativ_curric'].replace(/\s+/g, ' ').trim() + ' não lançada ou duplicada.';
                        }
                        k++;
                    });
                    sendTextMessage(senderID, sendString, 0);
                });
            });
        });
}

function sendMenuMessage(recipientId, messageText, timeOfMessage) {

    console.log(timeOfMessage);
    buttonsAll = [
        {
        type: 'postback',
        title: 'Hoje',
        payload: 'button-cardapio-hoje'
        },
        {
            type: 'postback',
            title: 'Amanhã',
            payload: 'button-cardapio-amanha'
        },
        {
            type: 'postback',
            title: 'Semana',
            payload: 'button-cardapio-semana'
        }
    ];
    buttonsFriday = [
        {
            type: 'postback',
            title: 'Hoje',
            payload: 'button-cardapio-hoje'
        },
        {
            type: 'postback',
            title: 'Semana',
            payload: 'button-cardapio-semana'
        }
    ];
    buttonsSaturday = [
        {
            type: 'postback',
            title: 'Semana',
            payload: 'button-cardapio-semana'
        }
    ];
    buttonsSundayAndAfterDinner = [
        {
            type: 'postback',
            title: 'Amanhã',
            payload: 'button-cardapio-amanha'
        },
        {
            type: 'postback',
            title: 'Semana',
            payload: 'button-cardapio-semana'
        }
    ];

    var d = new Date()
    var dow = d.getDay(); // 0 = sunday
    var hour = d.getHours();
    var usedButton;

    if (dow == DOWS.SATURDAY) {
        usedButton = buttonsSaturday;
    }
    else if (dow == DOWS.FRIDAY) {
        usedButton = buttonsFriday;
    }
    else if (dow == DOWS.SUNDAY || hour > 19) {
        usedButton = buttonsSundayAndAfterDinner;
    }
    else
        usedButton = buttonsAll;
    var message_data = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Cardápio Bandejão UNIRIO",
                        subtitle: "Ziom! Vejo que quer acessar o cardápio do bandejão. Qual dia você deseja acessar?",
                        buttons: usedButton
                    }]
                }
            }
        }
    };
    callSendAPI(message_data);
}

function sendBilheteUnico(recipientID) {
    var button = [{
        type: 'postback',
        title: staticMessages["bilhete-unico"].button.label,
        payload: staticMessages["bilhete-unico"].button.postback
    }];

    var message_data = {
        recipient: {
            id: recipientID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Bilhete Único",
                        subtitle: staticMessages["bilhete-unico"].message,
                        buttons: button
                    }]
                }
            }
        }
    };

    callSendAPI(message_data);
}



function sendGenericMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTodayMessage(senderID, timeOfPostback) {
    pg.connect(process.env.DATABASE_URL, (err, clint) => {
        if(err)
            throw err;

        console.log('Connected to Postegres on SendTodayMessage');

    });
}

function sendTomorrowMessage(senderID, timeOfPostback) {
    pg.connect(process.env.DATABASE_URL, (err, clint) => {
        if(err)
            throw err;

        console.log('Connected to Postegres on SendTodayMessage');

    });
}

function sendRestOfWeekMessage(senderID, timeOfPostback) {
    pg.connect(process.env.DATABASE_URL, (err, clint) => {
        if(err)
            throw err;

        console.log('Connected to Postegres on SendTodayMessage');

    });
}


module.exports = {
    sendTextMessage: sendTextMessage,
    sendGenericMessage: sendGenericMessage,
    sendMenuMessage: sendMenuMessage,
    sendGradeMessage: sendGradeMessage,
    sendBilheteUnico: sendBilheteUnico
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