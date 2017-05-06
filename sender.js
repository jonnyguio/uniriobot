const request = require('request');
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

            console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });  
}

function sendTextMessage(recipientId, messageText) {
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
    var usedButton;

    if (dow == DOWS.SATURDAY) {
        usedButton = buttonsSaturday;
    }
    else if (dows == DOWS.FRIDAY) {
        usedButton = buttonsFriday;
    }
    else if (dows == DOWS.SUNDAY) {
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


module.exports = {
    sendTextMessage: sendTextMessage,
    sendGenericMessage: sendGenericMessage,
    sendMenuMessage: sendMenuMessage
}