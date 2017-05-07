const request = require('request');
const pg = require('pg');
const pageToken = process.env.PAGETOKEN;

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

function sendRoomsMessage(senderID) {
    request.get('https://graph.facebook.com/v2.6/' + senderID + '?fields=first_name,last_name&access_token=' + pageToken,
        function (error, response, body) {
            console.log('body:', body); // Print the HTML for the Google homepage.
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
                        title: "Cardapio",
                        subtitle: "Cardapio do Bandejão da UNIRIO",
                        buttons: usedButton
                    }]
                }
            }
        }
    };
    callSendAPI(message_data);
}

function sendBilheteUnico(recipientID) {
    var button = {
        type: 'postback',
        title: 'Cadastramento',
        payload: 'button-bilhete-unico-cadastramento'
    };

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
                        subtitle: "O que deseja saber quanto ao Bilhete Único Universitário?",
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
    sendRoomsMessage: sendRoomsMessage,
    sendBilheteUnico: sendBilheteUnico
}