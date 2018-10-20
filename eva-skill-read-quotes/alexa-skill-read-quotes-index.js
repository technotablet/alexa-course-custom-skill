const Alexa = require("ask-sdk");
const actions = require("./functions");

const Quotes = {
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

// Launch Request Handler -- When a skill is launched
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    console.log("Launch Request Handler Called");

    let speechText =
      "Hello, I am Eva. You can ask me to read out quotes from Einstein, and Abraham Lincoln.";
    let repromptText =
      "I did not receive any input. You can say, tell me a random quote.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  }
};

// Handler for Random Quote
const RandomQuote = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "RandomQuote"
    );
  },
  handle(handlerInput) {
    console.log("RandomQuote intent handler called");

    let getQuote = actions.getQuote(Quotes);
    let author = getQuote[0];
    let quote = getQuote[1];

    let cardTitle = "Quotation from " + author;
    let cardContent = quote;
    let speechText = author + " said " + quote;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(cardTitle, cardContent)
      .getResponse();
  }
};

const AuthorQuote = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AuthorQuote"
    );
  },
  handle(handlerInput) {
    console.log("AuthorQuote Intent handler called");

    // Get the Author Name
    let author = handlerInput.requestEnvelope.request.intent.slots.author.value;

    let getQuote = actions.getQuote(Quotes, author);

    if (!getQuote) {
      return UnhandledHandler.handle(handlerInput);
    }

    author = getQuote[0];
    let quote = getQuote[1];

    let cardTitle = "Quotation from " + author;
    let cardContent = quote;
    let speechText = author + " said " + quote;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(cardTitle, cardContent)
      .getResponse();
  }
};

// Unhandled Requests
const UnhandledHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error Handler : ${error.message}`);

    return handlerInput.responseBuilder
      .speak(
        "Sorry, I am unable to understand what you said. You can ask me to say a random quotation"
      )
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, RandomQuote, AuthorQuote)
  .addErrorHandlers(UnhandledHandler)
  .lambda();

