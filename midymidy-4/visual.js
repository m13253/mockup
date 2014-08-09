/*!
  @file bubbles.js
  @author StarBrilliant <m13253@hotmail.com>
  @license Commercial
*/
(function () {
var visualRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (func) { return setTimeout(func, 16); };
function updateVisual() {
    var canvas = document.getElementById("visual");
    var context = canvas.getContext("2d");
    var stage = document.getElementById("stage");
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawKbgrid(canvas, context, stage);
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, canvas.height);
    context.moveTo(canvas.width, 0);
    context.lineTo(0, canvas.height);
    context.stroke();
    context.font = 16*canvas.dataScaleFactor+"px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillStyle = "black";
    context.fillText("↓↓↓ Gaussian blur effect starts from here ↓↓↓", canvas.width/2, (stage.offsetTop+stage.clientHeight)*canvas.dataScaleFactor);
}
function drawKbgrid(canvas, context, stage) {
    if(canvas.width < 480)
        return;
    var offset = stage.offsetTop*canvas.dataScaleFactor;
    var height = stage.clientHeight*canvas.dataScaleFactor;
    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    for(var i = 1/16; i < 128; i += 12) {
        context.rect(canvas.width*(i+1)/128, offset, canvas.width*0.875/128, height);
        context.rect(canvas.width*(i+3)/128, offset, canvas.width*0.875/128, height);
        context.rect(canvas.width*(i+6)/128, offset, canvas.width*0.875/128, height);
        context.rect(canvas.width*(i+8)/128, offset, canvas.width*0.875/128, height);
        context.rect(canvas.width*(i+10)/128, offset, canvas.width*0.875/128, height);
    }
    context.fill();
    context.beginPath();
    context.lineWidth = canvas.width/1024;
    context.strokeStyle = "rgba(0, 0, 0, 0.5)"
    for(var i = 12; i < 128; i += 12) {
        context.moveTo(canvas.width*i/128, offset);
        context.lineTo(canvas.width*i/128, offset+height);
    }
    context.stroke();
    context.beginPath();
    context.strokeStyle = "rgba(0, 0, 0, 0.25)"
    for(var i = 0; i < 128; i += 12)
        for(var j = i; j < i+12; j++) {
            context.moveTo(canvas.width*j/128, offset);
            context.lineTo(canvas.width*j/128, offset+height);
        }
    context.stroke();
}
function getCanvasPixelRatio(el) {
    var context = el.getContext("2d");
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStorePixelRatio = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || 1;
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
});
}());
