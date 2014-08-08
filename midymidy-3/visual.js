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
        context.drawImage(bgimg, 0, stage.offsetTop*canvas.dataScaleFactor, canvas.width, stage.clientHeight*canvas.dataScaleFactor);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, canvas.height);
    context.moveTo(canvas.width, 0);
    context.lineTo(0, canvas.height);
    context.stroke();
    context.font = 16*canvas.dataScaleFactor+"px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText('↓↓↓ Gaussian blur effect starts from here ↓↓↓', canvas.width/2, (stage.offsetTop+stage.clientHeight)*canvas.dataScaleFactor);
}
function getCanvasPixelRatio(el) {
    var context = el.getContext("2d");
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStorePixelRatio = window.backingStorePixelRatio || context.webkitBackingStorePixelRatio || 1;
    return devicePixelRatio/backingStorePixelRatio;
}
window.addEventListener("load", function () {
    var visual = document.getElementById("visual");
    var pagefoot = document.getElementById("pagefoot");
    var resizefunc = function () {
        visual.dataScaleFactor = getCanvasPixelRatio(visual);
        visual.width = document.body.clientWidth * visual.dataScaleFactor;
        visual.height = pagefoot.offsetTop * visual.dataScaleFactor;
        visual.style.height = pagefoot.offsetTop + "px";
        updateVisual();
    };
    window.addEventListener("resize", resizefunc);
    resizefunc();
    visualRequestAnimationFrame(updateVisual);
    bgimg.addEventListener("load", function () { this.loaded = true; updateVisual(); });
    bgimg.src = "kbgrid.svg";
});
}());
