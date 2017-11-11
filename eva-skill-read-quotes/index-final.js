var Alexa = require('alexa-sdk');

var QuoteDataObj = {
                    Lincoln: [
                        "Government of the people, by the people, for the people, shall not perish from the Earth.",
                        "Nearly all men can stand adversity, but if you want to test a man's character, give him power.",
                        "Whatever you are, be a good one."
                        ],
                    Einstein: [
                        "Imagination is more important than knowledge.",
                        "If the facts don't fit the theory, change the facts.",
                        "Life is like riding a bicycle. To keep your balance you must keep moving."
                        ]
};

// a separate function that takes out the quote and returns the author and quote
function getQuoteFunction(author) {
    
    console.log("Getting into getQuoteFunction");
    
    // Get random author if author is not defined
    if (author === undefined) {
        
        var totalauthors = Object.keys(QuoteDataObj).length;
        var rand = Math.floor(Math.random() * totalauthors);
        
        // random author name
        author = Object.keys(QuoteDataObj)[rand];
    }
    
    // check the author if it exists, and have a single author name
    switch (author) {
        case 'Lincoln': author = 'Lincoln'; break;
        case 'Abraham Lincoln': author = 'Lincoln'; break;
        case 'Abe Lincoln': author = 'Lincoln'; break;
        case 'Einstein': author = 'Einstein'; break;
        case 'Albert Einstein': author = 'Einstein'; break;
        default: author = "Unknown";
    }
    
    // if author is unknown, return false
    if (author == "Unknown") {
        console.log("Author not found. Return false");
        return false;
    }
    
    // Get total quotations for the author from the QuoteDataObj object
    var totalquotations = QuoteDataObj[author].length;
    
    // Select a random quotation
    var randquote = Math.floor(Math.random() * totalquotations);
    var quote = QuoteDataObj[author][randquote];
    
    console.log("Return author and quote");
    
    // return both the author name and quote as an array
    return [author, quote];
}


var handlers = {
    
    // When launched without any action
    'LaunchRequest': function() {
        
        console.log("Launch Request Handler Called");
        
        // Forward it to Introduction Handler
        this.emit('Introduction');
    },
    
    // can go under LaunchRequest also, but separating it out, just to look cool
    'Introduction': function() {
        
        console.log("Introduction Handler called.");
        
        // The user opened the skill without providing any action or intent
        var speechOutput = "Hello, I am Eva. You can ask me to read out quotes from Einstein, and Abraham Lincoln";
        
        // In case the user did not provide any input
        var repromptText = "I did not receive any input. Thank you and good bye.";
        
        // Just speak it out through an Alexa Device
        this.emit(':ask', speechOutput, repromptText);
    },
    
    // Defined Intents linked with Skill Start Here
    
    // Intent - When a user asks for a random quote
    'RandomQuote': function () {
        
        console.log("RandomQuote Intent Handler Called");
        
        // Call the getQuoteFunction() to get an array of author and quotation
        var getQuote = getQuoteFunction();
        var author = getQuote[0];
        var quote = getQuote[1];
        
        // The cardTitle & cardContent is important for Alexa App and Echo Show Devices
        var cardTitle = "Quotation from " + author;
        var cardContent = quote;
        var speechOutput = author + " said, " + quote;
        
        // Speak out the output along with card information
        this.emit(':tellWithCard', speechOutput, cardTitle, cardContent);
        
    },
    
    // Intent - When a user asks for quote from a specific author
    'AuthorQuote': function () {
        
        console.log("Author Quote Intent Handler Called.");
        
        // Get the author name from the Slot Value specific to this intent
        var author = this.event.request.intent.slots.author.value;
        var getQuote = getQuoteFunction(author);
        
        // if getQuoteFunction wasn't able to detect the author, then send to Unhandled Intent
        if (!getQuote) {
            this.emit('Unhandled');
        }
        
        // Override the author name with the one received from the getQuoteFunction
        author = getQuote[0];
        var quote = getQuote[1];
        
        var cardTitle = "Quotation from " + author;
        var cardContent = quote;
        var speechOutput = author + " said, " + quote;
        
        this.emit(':tellWithCard', speechOutput, cardTitle, cardContent);
    },
    
    // Intent - Unhandled. It is not a built-in intent.
    'Unhandled': function () {
        
        console.log("Unhandled Intent Handler Called.");
        
        this.emit(':tell', "Sorry, I am unable to understand what you said. You can ask me to say a random quotation");
    }
};

// export the handler for node.js
exports.handler = function(event, context, callback) {
    
    // alexa object via the alexa-sdk
    var alexa = Alexa.handler(event, context, callback);
    
    // register & execute all the handlers/intents that are created
    alexa.registerHandlers(handlers);
    alexa.execute();
};



















