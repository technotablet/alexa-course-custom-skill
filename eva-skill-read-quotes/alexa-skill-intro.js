// Include the Alexa SDK v2
const Alexa = require("ask-sdk");

// The "LaunchRequest" intent handler - called when the skill is launched
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Hello, I am Eva! I am glad to meet you.";

    // Speak out the speechText via Alexa
    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};

// Register the handlers and make them ready for use in Lambda
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler)
  .lambda();

