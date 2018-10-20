const Alexa = require("ask-sdk");
const actions = require('./functions');

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

// Bookmarked Places and their coordinates
// Future Upgrade - make them come from a database like DynamoDB
// NOTE: All entries to be in lower case, and no space between coordinates
const Bookmarks = {
  "my office": "40.819940,-73.950431",
  "my in laws": "40.667101,-73.949807",
  "the airport": "40.641360,-73.778150"
};

// User and Google API configuration related variables
// 1. Setting Coordinates for your home/origin
var user_origin = "40.745908,-73.946989";
var user_destination = "XXXXXX"; // keep it as XXXXXX as it will be replaced later

// 2. Google Maps Directions API Related Data
// 2a. API Key - Unique for every user
var google_api_key = "AIzaSyBz7jVWlbfCrns-aeLFs6cNd51rBmK2dOE"; // CHANGE IT WITH YOUR API KEY

// 2b. Setting the configurable options for the API
var google_api_traffic_model = "best_guess"; // it can be optimistic & pessimistic too
var google_api_departure_time = "now"; // now will mean the current time

// 2c. Deconstructing the API URL
// https://maps.googleapis.com/maps/api/directions/json?origin=40.745908,-73.946989&traffic_model=best_guess&key=AIzaSyBz7jVWlbfCrns-aeLFs6cNd51rBmK2dOE&departure_time=now
var google_api_host = "maps.googleapis.com";
var google_api_path = "/maps/api/directions/json?origin=" +
  user_origin +
  "&destination=" +
  user_destination +
  "&key=" +
  google_api_key +
  "&traffic_model=" +
  google_api_traffic_model +
  "&departure_time=" +
  google_api_departure_time;

// Launch Request Handler -- When a skill is launched
const LaunchRequestHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
      console.log("Launch Request Handler Called");
      
      let speechText = "Hi, I am Eva, your cloud based personal assistant. You can ask me to read quotes from Einstein or Lincoln, or ask me to get route information.";
      let repromptText = "Sorry, I did not receive any input. Do you need help?";
      
      // Setting the attributes property for data persistence
      // If the user says "Yes" to the repromptText question, the script will know what to do next
      handlerInput.attributesManager.setSessionAttributes({ type: "help"});
      
      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  }
};

// Handler for Random Quote
const RandomQuote = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'RandomQuote';
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
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'AuthorQuote';
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

// Get the list of bookmarked places
const GetBookmarks = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetBookmarks"
      );
  },
  handle(handlerInput) {
    console.log("GetBookmarks Intent Handler Called");
    
    // Get the list of Keys for Bookmarks Object
    let keys = Object.keys(Bookmarks);
    let destinations = "";
    
    // Now iterate through the array and create a statement of places
    for (let i=0; i<keys.length; i++) {
      // OPTIONAL: if it is the last destination, add the keyword "and"
      if (i==keys.length-1) {
        destinations += " and ";
      }
      
      // add the destinations and append comma with each to make it a proper speech
      destinations += keys[i] + ", ";
    }
    
    let speechText = "Your bookmarked places are " + destinations;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

// If user asks for Help
const HelpIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
      );
  },
  handle(handlerInput) {
    console.log("HelpIntent Handler Called");
    
    // Setting the attributes property for data persistence within the session
    let attributes = {
      type: "bookmarks"
    };
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    let speechText = "I have the ability to read out quotes and get route information. To read out quotes, you can try saying, ask Eva for a random quote, or ask Eva for a quote from Einstein. To get route information you can try saying, ask Eva, how much time will it take you to reach office? I also have a few places bookmarked for easy access. Do you want me to read them out to you?";
    
    let repromptText = "Sorry, I did not receive any input. Do you want me to read out your bookmarked destinations?";
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  }
};


// If the user said "Yes" to anything
const YesIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
      );
  },
  handle(handlerInput) {
    console.log("AMAZON.YesIntent intent handler called");
    
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    let speechText = "";
    
    if (attributes.type) {
      switch (attributes.type) {
        case "bookmarks":
          return GetBookmarks.handle(handlerInput);
        case "help":
          return HelpIntent.handle(handlerInput);
          
        default:
          speechText = "Sorry, I do not understand how to process that.";
      }
      
    } else {
      speechText = "Sorry, I am not sure what you are saying Yes for.";
    }
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};


// When the user says "No" to a request
const NoIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent"
      );
  },
  handle(handlerInput) {
    console.log("NoIntent intent handler called");
    return handlerInput.responseBuilder
      .getResponse();
  }
};

// Gracefully handle any intent that wasn't handled
const Fallback = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.FallbackIntent"
      );
  },
  handle(handlerInput) {
    console.log("FallbackIntent Handler called");
    
    let speechText = "Sorry, I wasn't able to understand what you said. Thank you and good bye.";
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

// Get Route Intent Handler
const GetRoute = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetRoute"
      );
  },
  // It will be an asynchronous function
  async handle(handlerInput) {
    console.log("GetRoute Intent Handler called");
    
    // The slot information
    let slotdata = handlerInput.requestEnvelope.request.intent.slots;
    console.log("Slot Values --> " + JSON.stringify(slotdata));
    
    let speechText = "";
    
    // destination address - can be the bookmark's coordinates or a postal address
    let destination = "";
    
    // what alexa sould speak out once a destination is provided
    let speakdestination = "";
    
   // The slot value
   let slot = "";
   
   // Get the "destination" from the "slot value"
   if (slotdata.destination.value) {
    slot = slotdata.destination.value.toLowerCase();
    console.log("Destination Slot was detected. The value is " + slot);
   }
   
   // First try to get the value from bookmarks
   if (Bookmarks[slot]) {
     destination = Bookmarks[slot];
     speakdestination = slot.replace("my ", "your ");
   } else {
     destination = slot;
     speakdestination = destination;
   }
   
   // If there is no destination available, ask for the destination
   if (destination === "") {
     console.log("Destination is blank");
     
     let speechText = "Where would you like to go today?";
     let repromptText = "Sorry, I did not receive any input. Do you want me to read out your bookmarked destinations?";
     
     handlerInput.attributesManager.setSessionAttributes({
       type: "bookmarks"
     });
     
     return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
   }
   
   console.log("Destination is not blank");
   
   // Prepare the final google API path
   // replacing XXXXXX (user_destination variable) with a url encoded version of the actual destination
   let final_api_path = google_api_path.replace(user_destination, encodeURIComponent(destination));
   
   // https "options"
   let options = {
     host: google_api_host,
     path: final_api_path,
     method: "GET"
   };
   
   // Log the complete Google URL for your review / cloudwatch
   console.log("Google API Path --> https://" + google_api_host + final_api_path);
   
   try {
     let jsondata = await actions.getData(options);
     console.log(jsondata);
     
     // 1. Check the status first
     let status = jsondata.status;
     
     if (status == "OK") {
       
        // Get the duration in traffic from the json array
        let duration = jsondata.routes[0].legs[0].duration_in_traffic.text;
        
        // Google API returns "min" in response. Replace the "min" with "minute" (OPTIONAL)
        // duration = duration.replace("min","minute");
        
        // Get the value in seconds too so that you can do the time calculation
        let seconds = jsondata.routes[0].legs[0].duration_in_traffic.value;
        
        // Initialise a new date, add 300 seconds (5 minutes) to it,
        // to compensate for the delay it will take to get to your vehicle.
        // Then get the hour and the minute only, and not the complete date.
        let nd = new Date();
        let ld = new Date(nd.getTime() + (seconds + 300 )* 1000);
        let timeinhhmm = ld.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
        
        // let timeinhhmm = ld.toLocaleTimeString("en-US", {timeZone: 'Asia/Kolkata', hour:'2-digit', minute: '2-digit'});
        // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
        
        speechText = "It will take you " + duration + " to reach " + speakdestination + ". You will reach around " +
                     "<say-as interpret-as='time'>" + timeinhhmm + "</say-as> if you leave within 5 minutes";
       
     } else {
       speechText = "Sorry, I was not able to get traffic information for your destination " + speakdestination + ". Please try a different destination";
     }
     
   } catch (error) {
     speechText = "Sorry, an error occurred getting data from Google. Please try again.";
     console.log(error);
   }
   
   return handlerInput.responseBuilder
    .speak(speechText)
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
        .speak('Sorry, I am unable to understand. For help, ask Eva, and say you need Help')
        .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RandomQuote,
        AuthorQuote,
        GetBookmarks,
        HelpIntent,
        YesIntent,
        NoIntent,
        Fallback,
        GetRoute
    )
    .addErrorHandlers(UnhandledHandler)
    .lambda();
    

