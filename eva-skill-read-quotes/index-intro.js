var Alexa = require('alexa-sdk');

var handlers = {
    
    // When launched without any action
    'LaunchRequest': function () {

        console.log("Launch Request Intent Handler Called");
        
        this.emit(':tell', "Hello, I am Eva! I am glad to meet you.");
    },
};

exports.handler = function(event, context, callback){

    // alexa object via the alexa-sdk
    var alexa = Alexa.handler(event, context, callback);

    // register & execute all the handlers/intents that are created
    alexa.registerHandlers(handlers);
    alexa.execute();
};

