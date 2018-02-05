models.export = function () {
    app.get("/", function (req, res) {
        app.render("index");
    });
}