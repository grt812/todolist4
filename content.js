console.log("loaded script");
window.addEventListener("message", function(event) {
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        console.log("bruh");
    }
});
