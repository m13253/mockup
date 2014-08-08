/*!
  @file bubbles.js
  @author StarBrilliant <m13253@hotmail.com>
  @license AGPL version 3
*/
(function () {
var visualRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (func) { return setTimeout(func, 16); };
var bgimg = new Image();
function updateVisual() {
    var canvas = document.getElementById("visual");
    var context = canvas.getContext("2d");
    var stage = document.getElementById("stage");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(bgimg.loaded)
        context.drawImage(bgimg, 0, stage.offsetTop, canvas.width, stage.clientHeight);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, canvas.height);
    context.moveTo(canvas.width, 0);
    context.lineTo(0, canvas.height);
    context.stroke();
    context.font = "12pt sans-serif";
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText('↓↓↓ Gaussian blur effect starts from here ↓↓↓', canvas.width/2, stage.offsetTop+stage.clientHeight);
}
window.addEventListener("load", function () {
    var visual = document.getElementById("visual");
    var pagefoot = document.getElementById("pagefoot");
    var resizefunc = function () {
        visual.width = document.body.clientWidth;
        visual.style.height = (visual.height = pagefoot.offsetTop) + "px";
        updateVisual();
    };
    window.addEventListener("resize", resizefunc);
    resizefunc();
    visualRequestAnimationFrame(updateVisual);
    bgimg.addEventListener("load", function () { this.loaded = true; updateVisual(); });
    bgimg.src = "kbgrid.svg";
});
}());
