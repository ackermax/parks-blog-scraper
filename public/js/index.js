$(document).ready(function(){
    $(".art-scrape").click(function(e){
        e.preventDefault();
        console.log("click!")
        $.get("/scrape").then(function(result){
            console.log(result);
        });
    });
});