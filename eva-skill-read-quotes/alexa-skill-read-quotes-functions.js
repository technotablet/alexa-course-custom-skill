const myfunctions = {
  // Take out the quote and return author as well as quote
  getQuote: function(quotes, author) {
    console.log("Getting into getQuoteFunction");

    // Get random author if author is not defined
    if (author === undefined) {
      var totalauthors = Object.keys(quotes).length;
      var rand = Math.floor(Math.random() * totalauthors);

      // random author name
      author = Object.keys(quotes)[rand];
    }

    // check the author if it exists, and have a single author name
    switch (author) {
      case "Lincoln":
        author = "Lincoln";
        break;
      case "Abraham Lincoln":
        author = "Lincoln";
        break;
      case "Abe Lincoln":
        author = "Lincoln";
        break;
      case "Einstein":
        author = "Einstein";
        break;
      case "Albert Einstein":
        author = "Einstein";
        break;
      default:
        author: "Unknown";
    }

    // Get total quotations for the author from the Quotes object
    var totalquotations = quotes[author].length;

    // Select a random quotation
    var randquote = Math.floor(Math.random() * totalquotations);
    var quote = quotes[author][randquote];

    console.log("Return author and quote");

    // return both the author name and the quote as an array
    return [author, quote];
  }
};

module.exports = myfunctions;

