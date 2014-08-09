/*!
  @file visual.js
  @author StarBrilliant <m13253@hotmail.com>
  @license Commercial
*/
(function () {
var channel_color = [
    "rgba(255,  51,  51, 0.8)", "rgba(102, 102, 255, 0.8)",
    "rgba(255, 255,  51, 0.8)", "rgba(102, 255,  51, 0.8)",
    "rgba(255, 102, 153, 0.8)", "rgba(102,   0, 102, 0.8)",
    "rgba(  0, 204, 255, 0.8)", "rgba(153,  51,  51, 0.8)",
    "rgba( 51,  51,   0, 0.8)", "rgba(  0,   0,   0, 0.8)",
    "rgba(204,  51,   0, 0.8)", "rgba(  0,  51, 102, 0.8)",
    "rgba(255,  51, 204, 0.8)", "rgba(153, 153, 102, 0.8)",
    "rgba(153,   0,   0, 0.8)", "rgba(  0,  51,   0, 0.8)"
];
window.startVisual = function (url) {
    loadMidi(url,
    function () { /* onload */
    },
    function () { /* onerror */
        document.getElementById("progressline").style.width = "100%";
        document.getElementById("progressline").style.backgroundColor = "darkred";
        document.getElementById("progressline").style.boxShadow = "0rem 0rem 0.125rem 0rem darkred";
    },
    function (e) { /* onprogress */
        document.getElementById("progressline").style.width = 50+50*e.loaded/e.total+"%";
    },
    function (xhr) { /* onxhrready */
        xhr.addEventListener("progress", function (e) {
            if(e.lengthComputable)
                document.getElementById("progressline").style.width = 50*e.loaded/e.total+"%";
        });
        xhr.addEventListener("load", function (e) {
            document.getElementById("progressline").style.width = "50%";
        });
    });
}
function updateVisual() {
    var canvas = document.getElementById("visual");
    var context = canvas.getContext("2d");
    var stage = document.getElementById("stage");
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawKbgrid(canvas, context, stage);
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
lastNonce = 0;
function getNonce() {
    return ++lastNonce;
}
function getCanvasPixelRatio(el) {
    var context = el.getContext("2d");
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStorePixelRatio = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || 1;
    return devicePixelRatio/backingStorePixelRatio;
}
var visualRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (func) { return setTimeout(func, 16); };
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
