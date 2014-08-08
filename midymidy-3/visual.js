window.addEventListener("load", function () {
    var visual = document.getElementById("visual");
    var pagefoot = document.getElementById("pagefoot");
    var resizefunc = function () {
        visual.style.height = pagefoot.offsetTop+"px";
    };
    window.addEventListener("resize", resizefunc);
    resizefunc();
});
