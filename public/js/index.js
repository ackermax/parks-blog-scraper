$(document).ready(function(){
    $(".art-scrape").click(function(e){
        e.preventDefault();
        $(this).addClass("disabled");
        $.get("/scrape").then(function(){
            location.reload();
        });
    });
    $(".save-article").click(function(e){
        e.preventDefault();
        var id = $(this).attr("data-id");
        $.get("/save/" + id).then(function(){
            Materialize.toast("Article saved!", 3000);
        });
    });
});