/*!
  @file visual.js
  @author StarBrilliant <m13253@hotmail.com>
  @license Commercial
*/
(function () {
var channel_color = [
    "rgba(255,  51,  51, 0.75)", "rgba(255, 255,  51, 0.75)",
    "rgba(102, 255,  51, 0.75)", "rgba(255, 102, 153, 0.75)",
    "rgba(102,   0, 102, 0.75)", "rgba(  0, 204, 255, 0.75)",
    "rgba(153,  51,  51, 0.75)", "rgba( 51,  51,   0, 0.75)",
    "rgba(204,  51,   0, 0.75)", "rgba(  0,   0,   0, 0.75)", 
    "rgba(  0,  51, 102, 0.75)", "rgba(255,  51, 204, 0.75)",
    "rgba(153, 153, 102, 0.75)", "rgba(153,   0,   0, 0.75)",
    "rgba(  0,  51,   0, 0.75)", "rgba(102, 102, 255, 0.75)"
];
var channel_order = [15, 14, 13, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9];
var flowSpeed = 64;
var visualRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (func) { return setTimeout(func, 16); };
var visualPaused = true;
window.resumeVisual = function () {
    if(!visualPaused)
        return;
    visualPaused = false;
    var iterfunc = function () {
        if(visualPaused)
            return;
        paintVisual();
        visualRequestAnimationFrame(iterfunc);
    };
    visualRequestAnimationFrame(iterfunc);
};
window.pauseVisual = function () {
    visualPaused = true;
};
window.refreshVisual = function () {
    if(!visualPaused)
        paintVisual;
}
var midiData;
window.startVisual = function (url) {
    document.getElementById("progressline").style.width = undefined;
    document.getElementById("progressline").style.backgroundImage = undefined;
    document.getElementById("progresserror").style.visibility = undefined;
    submitMidiData();
    loadMidi(url,
        function (midiData_) { /* onload */
            submitMidiData(midiData_);
            paintVisual();
        },
        function () { /* onerror */
            document.getElementById("progressline").style.width = "100%";
            document.getElementById("progressline").style.backgroundImage = "linear-gradient(to bottom, rgba(139, 0, 0, 0) 0%, #8b0000 50%, rgba(139, 0, 0, 0) 100%)";
            document.getElementById("progresserror").style.visibility = "visible";
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
        }
    );
}
function paintVisual() {
    var canvas = document.getElementById("visual");
    var context = canvas.getContext("2d");
    var stage = document.getElementById("stage");
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawKbgrid(canvas, context, stage);
    drawNote(canvas, context, stage);
}
function drawKbgrid(canvas, context, stage) {
    if(canvas.width < 480)
        return;
    var offset = stage.offsetTop*canvas.dataScaleFactor;
    var height = stage.clientHeight*canvas.dataScaleFactor;
    context.beginPath();
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
function drawNote(canvas, context, stage) {
    if(!midiData)
        return;
    var timestamp = document.getElementById("player").currentTime;
    var progressline = document.getElementById("progressline");
    var progresspos = (progressline.offsetTop+progressline.clientHeight/2)*canvas.dataScaleFactor;
    var stagestart = stage.offsetTop*canvas.dataScaleFactor;
    var stageend = (stage.offsetTop+stage.clientHeight)*canvas.dataScaleFactor;
    context.save();
    context.beginPath();
    context.rect(0, stagestart, canvas.width, stageend-stagestart);
    context.clip();
    drawNoteRect(canvas, context, timestamp, progresspos, stagestart, stageend, true);
    context.restore();
}
function drawNoteRect(canvas, context, timestamp, progresspos, stagestart, stageend, mainarea) {
    var starttime  = timestamp+(stagestart-progresspos)/flowSpeed;
    var endtime    = timestamp+(stageend-progresspos)/flowSpeed;
    var startslice = Math.floor(starttime/midiData.slicelen);
    var endslice   = Math.ceil(endtime/midiData.slicelen);
    var nonce = getNonce();
    for(var channel_index = 0; channel_index < 16; channel_index++) {
        var channel = channel_order[channel_index];
        if(!midiData.timeslice[channel])
            continue;
        context.beginPath();
        context.fillStyle = channel_color[channel];
        for(slice = startslice; slice <= endslice; slice++)
            for(var idx in midiData.timeslice[channel][slice]) {
                var note = midiData.timeslice[channel][slice][idx];
                if(note.flag == nonce)
                    continue;
                else {
                    note.flag = nonce;
                    if(note.end > starttime || note.start < endtime)
                        context.rect(canvas.width*note.note/128, progresspos+(note.start-timestamp)*flowSpeed, canvas.width/128, (note.end-note.start)*flowSpeed);
                }
            }
        context.fill();
    }
}
window.submitMidiData = function (midiData_) {
    midiData = midiData_;
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
window.addEventListener("load", function () {
    var visual = document.getElementById("visual");
    var pagefoot = document.getElementById("pagefoot");
    var resizefunc = function () {
        visual.dataScaleFactor = getCanvasPixelRatio(visual);
        visual.width = document.body.clientWidth * visual.dataScaleFactor;
        visual.height = pagefoot.offsetTop * visual.dataScaleFactor;
        visual.style.height = pagefoot.offsetTop + "px";
        paintVisual();
    };
    window.addEventListener("resize", resizefunc);
    resizefunc();
    var player = document.getElementById("player");
    player.addEventListener("play", resumeVisual);
    player.addEventListener("pause", pauseVisual);
    player.addEventListener("timeupdate", refreshVisual);
});
}());
