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
mongoose.connect(MONGODB_URI);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//public folder
app.use(express.static("public"));

require("./routes/routes.js");

app.get("/", function (req, res) {
  var date = new Date();

  db.Article.find({ "createdOn": { "$gte": date.setDate(date.getDate() - 1) } }).then(function (dbArticle) {
    res.render("index", { dbArticle: dbArticle });
  });
});


app.get("/saved", function (req, res) {
  db.Article.find({ "saved": true }).then(function (dbArticle) {
    res.render("saved", { dbArticle: dbArticle });
  });
});
app.get("/scrape", function (req, res) {
  axios.get("https://disneyparks.disney.go.com/blog/latest-stories/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("img.attachment-thumb-260x146").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.picture = $(this)
        .attr("src");
      result.title = $(this)
        .parent("a")
        .attr("title");
      result.link = $(this)
        .parent("a")
        .attr("href");
      result.author = $(this)
        .parent()
        .parent()
        .next()
        .children("div.header-arrow")
        .children("div.module-byuser")
        .children("p")
        .children("a")
        .text();
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          res.status(400);
          throw err;
        });
    });
    res.json({ status: true });
  });
});

app.get("/save/:id", function (req, res) {
  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } }, { new: true })
    .then(function (dbArticle) {
      res.json(dbArticle);
    });
});

app.get("/delete/:id", function (req, res) {
  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: false } }, { new: true })
    .then(function (dbArticle) {
      res.json(dbArticle);
    });
});

app.get("/notes/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    });
});

app.post("/notes/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/notes/delete/:id", function (req, res) {
  db.Note.findOneAndRemove({ _id: req.params.id }).then(function (dbNote) {
    db.Article.findOneAndUpdate({ "note._id": req.params.id }, { note: undefined }).then(function (dbArticle) {
      res.json(dbArticle);
    });
  });
});
// Starting our server!
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});