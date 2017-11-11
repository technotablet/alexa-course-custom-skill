var Alexa = require('alexa-sdk');
var https = require('https');

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

// Bookmarked Places and their coordinates
// Future upgrade - make them come from a database such as DynamoDB
// NOTE: All entries to be in lower case, and no space between coordinates
var BookmarkedObj = {
    "my office": "40.819940,-73.950431",
    "my in laws": "40.667101,-73.949807",
    "the airport": "40.641360,-73.778150"
};

// User and Google API configuration related variables
// 1. Setting Coordinates for your home / origin
var user_origin = "40.745908,-73.946989";
var user_destination = "XXXXXX"; // keep it as XXXXXX as it will be replaced later

// 2. Google Maps Directions API Related Data
// 2a. API Key - Unique for every user
var google_api_key = "AIzaSyBsB8q2NOK9DCuwIsOOSkqwD6VnRpP83oI"; // CHANGE IT WITH YOUR API KEY

// 2b. Setting the configurable options for the API
var google_api_traffic_model = "best_guess"; // it can be optimistic & pessimistic too
var google_api_departure_time = "now"; // now will mean the current time

// 2c. Deconstructing the API URL
// https://maps.googleapis.com/maps/api/directions/json?origin=40.745908,-73.946989&traffic_model=best_guess&key=AIzaSyBsB8q2NOK9DCuwIs00SkqwD6VnRpP83oI&departure_time=now
var google_api_host = "maps.googleapis.com";
var google_api_path = "/maps/api/directions/json?origin=" + user_origin + "&destination=" + user_destination + "&key=" + google_api_key + "&traffic_model=" + google_api_traffic_model + "&departure_time=" + google_api_departure_time;

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

// get data from a URL asynchronously.
// Once you get the data, call the callback method with the response
function getData(options, callback) {
    
    var text = "";
    
    https.get(options, function(res) {
        res.on("data", function(chunk) {
            text += chunk.toString('utf-8');
        });
        
        res.on('end', function() {
            return callback(text);
        });
    }).on('error', function(e) {
        text = 'error' + e.message;
        console.error("Got error: " + e.message);
        return callback('ERROR');
    });
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
        var speechOutput = "Hi, I am Eva, your cloud based personal assistant. You can ask me to read quotes from Einstein or Lincoln, or ask me to get route information.";
        
        // In case the user did not provide any input
        var repromptText = "Sorry, I did not receive any input. Do you need help?";

        // Setting the attributes property for data persistence, especially when using the :ask action
        // If the user says Yes to the repromptText question, the script will know what to do next
        this.attributes['type'] = "help";
        
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
    
    'GetBookmarks': function() {
        
        // Get the list of Keys for BookmarkedObj
        var keys = Object.keys(BookmarkedObj);
        var destinations = "";
        
        // Now iterate through the object and create a statement of the places
        for (i = 0; i < keys.length; i++) {
            
            // if it is the last destination, add the keyword "and"
            if (i == (keys.length -1)) {
                destinations += "and ";
            }
            
            // add the destinations and append comma with each to make it a proper speech
            destinations += keys[i] + ", ";
        }
        
        var speechOutput = "Your bookmarked places are " + destinations;
        
        this.emit(":tell", speechOutput);
    },
    
        // If the user asks for help
    'AMAZON.HelpIntent': function () {
      
      console.log("Help Intent Handler called");
      
      // Setting the attributes property for data persistence, especially when using the :ask action
      this.attributes['type'] = "bookmarks";
      
      var speechOutput = "I have the ability to read out quotes and get route information. To read out quotes, you can try saying, ask Eva for a random quote, or ask Eva for a quote from Einstein. To get route information you can try saying, ask Eva, how much time will it take you to reach office? I also have a few places bookmarked for easy access. Do you want me to read them out to you?";
      var repromptText = "Sorry, I did not receive any input. Do you want me to read out your bookmarked destinations?"
      
      this.emit(":ask", speechOutput, repromptText);
    },

    // If the user says Yes to a question
    'AMAZON.YesIntent': function () {
        
        console.log("Yes Intent Handler Called");
        
        if (this.attributes['type']) {
            // get the type of request from attributes property
            var reqtype = this.attributes['type'];
            var speechOutput = "Sorry, I do not understand how to process that.";
            
            switch (reqtype) {
                case 'bookmarks': this.emit('GetBookmarks'); break;
                case 'help': this.emit('AMAZON.HelpIntent'); break;
                default: this.emit(":tell", speechOutput);
            }
        } else {
            var speechOutput = "Sorry, I am not sure what you are saying Yes for.";
            this.emit(":tell", speechOutput);
        }
    },
    
    // If the user says No to a question
    'AMAZON.NoIntent': function () {
        
        console.log("No Intent Handler Called");
        
    },

    // Getting the route information
    'GetRoute': function () {
      
      // lot the slot value
      console.log("Slots -> " + JSON.stringify(this.event.request.intent.slots));
      
      // destination address - can be the bookmark's coordinates, or a postal address
      var destination = "";
      
      // what alexa should speak out when a destination is provided
      var speakdestination = "";
      
      // SUPER IMPORTANT
      // The "this" object is assigned to "self"
      // It will be used when the getData function is called
      var self = this;
      
      var slotvalue = "";
      // First check if the user requested a bookmarked place
      if (this.event.request.intent.slots.bookmarks.value) {
          
          slotvalue = this.event.request.intent.slots.bookmarks.value;
          console.log("Bookmarks slot was detected with value " + slotvalue);
          
      }
      
      // Otherwise consider the destination processed by AMAZON.PostalAddress slot type
      else if (this.event.request.intent.slots.postaladdress.value) {
          
          slotvalue = this.event.request.intent.slots.postaladdress.value;
          console.log("PostalAddress slot was detected with value " + slotvalue);
          
      }
      
      slotvalue = slotvalue.toLowerCase();

      // First try to get the value from bookmarks
      if (BookmarkedObj[slotvalue]) {
          destination = BookmarkedObj[slotvalue];
          speakdestination = slotvalue.replace("my ", "your ");
      } else {
          destination = slotvalue;
          speakdestination = destination;
      }
      
      // Now check, if you got the destination. If you didn't, then ask for it
      if (destination === "") {
          var speechOutput = "Where would you like to go today?";
          var repromptText = "Sorry, I did not receive any input. Do you want me to read out your bookmarked destinations?";
          
          // based on repromptText, setting the attribute property's type as bookmarks so that YesIntent can manage it
          this.attributes['type'] = "bookmarks";
          
          this.emit(":ask", speechOutput, repromptText);
          return;
      }
      
      // Get the final google API path
      // replacing XXX (user_destination variable) with a url encoded version of the destination
      var final_api_path = google_api_path.replace(user_destination, encodeURIComponent(destination));
      
      // parameters to pass to the https.get method
      var options = {
          host: google_api_host,
          // in path below, user_destination variable XXXXXX was replaced with a url encoded actual destination
          path: final_api_path,
          method:'GET'
      };
      
      // Log the complete Google URL for your review
      console.log("Google API Path -> https://" + google_api_host + final_api_path);
      
      // call the getData function to get the URL, asynchronously
      // Note that the callback parameter in the getData function is an anonymous function which processes jsondata
      getData(options, function (jsondata) {
          
          if (jsondata == 'ERROR') {
              var speechOutput = "Sorry, an error occurred getting data from Google. Please try again.";
              // call "self" instead of "this" because "this" will have a different value within this function
              self.emit(":tell", speechOutput);
          }
          else {
              
              var routeinfo = JSON.parse(jsondata);
              
              // 1. Check the status first
              var status = routeinfo.status;
              
              // 2. If status is OK, then read out a nice description
              if (status == "OK") {
                  
                  // Get the duration in traffic from the json array
                  var duration = routeinfo.routes[0].legs[0].duration_in_traffic.text;
                  // Google API returns "min" in response. replace the "min" with "minute"
                  duration = duration.replace("min","minute");
                  
                  // Get the value in seconds too so that you can do the time calculation
                  var seconds = routeinfo.routes[0].legs[0].duration_in_traffic.value;
                  
                  // Initialise a new date, add 300 seconds (5 minutes) to it,
                  // to compensate for the delay it will take to get to your vehicle.
                  // Then get the hour and the minute only, and not the complete date.
                  var nd = new Date();
                  var ld = new Date(nd.getTime() + ((seconds + 300) * 1000));
                  var timeinhhmm = ld.toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'});
                  //var timeinhhmm = ld.toLocaleTimeString("en-US", {timeZone: 'Asia/Kolkata', hour:'2-digit', minute:'2-digit'});
                  // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
                  
                  var speechOutput = "It will take you " + duration + " to reach " + speakdestination + ". You will reach around <say-as interpret-as=\"time\">" + timeinhhmm + "</say-as> if you leave within 5 minutes.";
                  self.emit(":tell", speechOutput);
                  
              } else {
                  
                  // whether the status is REQUEST_DENIED or ZERO_RESULTS, a common message is shown
                  var speechOutput = "Sorry, I was not able to get traffic information for your destination " + speakdestination + ". Please try a different destination.";
                  self.emit(":tell", speechOutput);
                  
              }
          }
      });
      

    },
    
    
    // Intent - Unhandled. It is not a built-in intent.
    'Unhandled': function () {
        
        console.log("Unhandled Intent Handler Called.");
        
        this.emit(':tell', "Sorry, I am unable to understand. For help, ask Eva, and say you need Help.");
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




















