var path = require ("path");

module.export = function (app) {
    app.get("/", function (req, res) {
        db.Article.find({ "createdOn": { "$gte": new Date() - 1 } }).then(function (dbArticle) {
            res.render("index", dbArticle);
        });
    });

    app.get("/saved", function (req, res) {
        res.render("saved");
    });

    app.get("/test", function(req, res){
        res.send("../public/main.html")
    });
}