//general requirements
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');

//requirements for Cheerio
var axios = require("axios");
var cheerio = require("cheerio");

//requiring our models
var db = require("./models");

var PORT = process.env.PORT || 3000

//initilize Express
var app = express();

//handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//mongoose
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoParksBlog";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//public folder
app.use(express.static("public"));

require("./routes/routes.js");

app.get("/", function (req, res) {
  db.Article.find({ "createdOn": { "$gte": new Date() - 1 } }).then(function (dbArticle) {
    res.render("index", dbArticle);
  });
});

app.get("/saved", function (req, res) {
  res.render("saved");
});

app.get("/scrape", function (req, res) {
  axios.get("https://disneyparks.disney.go.com/blog/latest-stories/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("img.wp-post-image").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.picture = $(this)
        .src;
      result.title = $(this)
        .parent("a")
        .attr("title");
      result.link = $(this)
        .parent("a")
        .attr("href");
      result.author = $(this)
        .next()
        .children("a")
        .text();
      // Create a new Article using the `result` object built from scraping
      console.log(result);
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Starting our server!
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});