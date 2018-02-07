$(document).ready(function () {
    $('.modal').modal();
    $(".delete-article").click(function (e) {
        e.preventDefault();
        var id = $(this).attr("data-id");
        $.get("/delete/" + id).then(function (data) {
            location.reload();
        });
    });
    $(".notes-article").click(function (e) {
        e.preventDefault;
        $("#notes").empty();
        var id = $(this).attr("data-id");
        $.get("/notes/" + id).then(function (data) {
            $("#notes").append('<h4 class="brand-logo">Notes</h4>');
            $("#notes").append("<div class='row'><form class='col s12'><div class='row'><div class='input-field col s9'><input id='titleinput' name='title' type='text'><label for='titleinput'>Title</label></div></div><div class='row'><div class='input-field col s12'><textarea id='bodyinput' class='materialize-textarea' name='body'></textarea><label for='bodyinput'>Note</label></div></div><div class='row'><a href='#' class='waves-effect waves-light btn teal submit-note left' data-id='" + id + "'>Submit Note</a></form></div>");

            if (data.note) {
                $("#notes").append('<div class="row"><h5><b>' + data.note.title + '</b></h5><br><p>' + data.note.body + "</p><br><a href='#' class='waves-effect waves-light btn red delete-note left' data-id='" + data.note._id + "'>Delete Note</a>");
            }
            $("#modal1").modal("open");
        });
    });

    $(document).on("click", ".submit-note", function (e) {
        e.preventDefault();
        var id = $(this).attr("data-id");
        var newNote = {
            title: $("#titleinput").val().trim(),
            body: $("#bodyinput").val().trim()
        };
        $.post("/notes/" + id, newNote).then(function (data) {
            $("#modal1").modal("close");
            Materialize.toast("Note saved!", 3000);
        });
    });

    $(document).on("click", ".delete-note", function(e){
        e.preventDefault();
        var id = $(this).attr("data-id");
        $.get("/notes/delete/" + id)
        .then(function(data){
            $("#modal1").modal("close");
            Materialize.toast("Note deleted!", 3000);
        });
    })
});