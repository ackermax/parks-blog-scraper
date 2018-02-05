//general requirements
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

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

require("./routes")(app);

// Starting our server!
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});