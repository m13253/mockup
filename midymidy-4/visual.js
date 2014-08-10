/*!
  @file visual.js
  @author StarBrilliant <m13253@hotmail.com>
  @license Commercial
*/
(function () {
var channel_color = [
    "255,  51,  51", "255, 255,  51",
    "102, 255,  51", "255, 102, 153",
    "102,   0, 102", "  0, 204, 255",
    "153,  51,  51", " 51,  51,   0",
    "204,  51,   0", "  0,   0,   0", 
    "  0,  51, 102", "255,  51, 204",
    "153, 153, 102", "153,   0,   0",
    "  0,  51,   0", "102, 102, 255"
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
        paintVisual();
        if(!visualPaused)
            visualRequestAnimationFrame(iterfunc);
    };
    visualRequestAnimationFrame(iterfunc);
};
window.pauseVisual = function () {
    visualPaused = true;
};
window.refreshVisual = function () {
    if(visualPaused)
        visualRequestAnimationFrame(paintVisual);
};
var midiData;
window.startVisual = function (url) {
    document.getElementById("progressline").style.width = undefined;
    document.getElementById("progressline").style.backgroundImage = undefined;
    document.getElementById("progresserror").style.visibility = undefined;
    submitMidiData();
    loadMidi(url,
        function (midiData_) { /* onload */
            submitMidiData(midiData_);
            refreshVisual();
        },
        function () { /* onerror */
            document.getElementById("progressline").style.width = "100%";
            document.getElementById("progressline").style.backgroundImage = "linear-gradient(to bottom, rgba(139, 0, 0, 0) 0%, #8b0000 50%, rgba(139, 0, 0, 0) 100%)";
            document.getElementById("progresserror").style.visibility = "visible";
        },
        function (e) { /* onprogress */
            document.getElementById("progressline").style.width = 50+50*e.loaded/e.total+"%";
            submitMidiData(e.midiData);
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
};
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
    context.globalAlpha = 0.1;
    context.fillStyle = "black";
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
    context.globalAlpha = 0.5;
    for(var i = 12; i < 128; i += 12) {
        context.moveTo(canvas.width*i/128, offset);
        context.lineTo(canvas.width*i/128, offset+height);
    }
    context.stroke();
    context.beginPath();
    context.globalAlpha = 0.25;
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
    var pagestart = document.body.scrollTop*canvas.dataScaleFactor;
    var pageend = (document.body.scrollTop+document.body.clientHeight)*canvas.dataScaleFactor;
    drawNoteSide(canvas, context, timestamp, progresspos, Math.max(0, pagestart), stagestart);
    drawNoteMain(canvas, context, timestamp, progresspos, Math.max(stagestart, pagestart), Math.min(stageend, pageend));
    drawNoteHighlight(canvas, context, timestamp, progresspos, stagestart, stageend);
    drawNoteSide(canvas, context, timestamp, progresspos, Math.max(stageend, pagestart), Math.min(canvas.height, pageend));
}
function drawNoteMain(canvas, context, timestamp, progresspos, stagestart, stageend) {
    if(stagestart >= stageend)
        return;
    var starttime  = timestamp+(stagestart-progresspos)/flowSpeed;
    var endtime    = timestamp+(stageend-progresspos)/flowSpeed;
    var startslice = Math.max(Math.floor(starttime/midiData.slicelen), 0);
    var endslice   = Math.ceil(endtime/midiData.slicelen);
    var nonce = getNonce();
    context.save();
    context.beginPath();
    context.rect(0, stagestart, canvas.width, stageend-stagestart);
    context.clip();
    context.globalAlpha = 0.75;
    for(var channel_index = 0; channel_index < 16; channel_index++) {
        var channel = channel_order[channel_index];
        if(!midiData.timeslice[channel])
            continue;
        context.beginPath();
        context.fillStyle = "rgb("+channel_color[channel]+")";
        for(slice = startslice; slice <= endslice; slice++)
            if(midiData.timeslice[channel][slice])
                for(var idx = 0; idx < midiData.timeslice[channel][slice].length; idx++) {
                    var note = midiData.timeslice[channel][slice][idx];
                    if(note.flag != nonce) {
                        note.flag = nonce;
                        if((note.end > starttime || note.start < endtime) && (note.end-note.start >= 1/flowSpeed))
                            context.rect(canvas.width*note.note/128, progresspos+(note.start-timestamp)*flowSpeed, canvas.width/128, (note.end-note.start)*flowSpeed);
                    }
                }
        context.fill();
    }
    context.restore();
}
function drawNoteSide(canvas, context, timestamp, progresspos, stagestart, stageend) {
    if(stagestart >= stageend)
        return;
    var starttime  = timestamp+(stagestart-progresspos)/flowSpeed;
    var endtime    = timestamp+(stageend-progresspos)/flowSpeed;
    var startslice = Math.max(Math.floor(starttime/midiData.slicelen), 0);
    var endslice   = Math.ceil(endtime/midiData.slicelen);
    var nonce = getNonce();
    context.save();
    context.beginPath();
    context.rect(0, stagestart, canvas.width, stageend-stagestart);
    context.clip();
    context.globalAlpha = 1;
    for(var channel_index = 0; channel_index < 16; channel_index++) {
        var channel = channel_order[channel_index];
        if(!midiData.timeslice[channel])
            continue;
        for(slice = startslice; slice <= endslice; slice++)
            if(midiData.timeslice[channel][slice])
                for(var idx = 0; idx < midiData.timeslice[channel][slice].length; idx++) {
                    var note = midiData.timeslice[channel][slice][idx];
                    if(note.flag != nonce) {
                        note.flag = nonce;
                        if((note.end > starttime || note.start < endtime) && (note.end-note.start >= 4/flowSpeed)) {
                            var x  = Math.round(canvas.width*(note.note+0.5)/128);
                            var x1 = Math.floor(canvas.width*(note.note-2)/128);
                            var x2 = Math.ceil(canvas.width*(note.note+3)/128);
                            var r  = Math.ceil(canvas.width*5/256);
                            var y1 = Math.floor(progresspos+(note.start-timestamp)*flowSpeed);
                            var y2 = Math.ceil(progresspos+(note.end-timestamp)*flowSpeed);
                            if(y1 > stagestart) {
                                var gradient = context.createRadialGradient(x, y1, 0, x, y1, r);
                                gradient.addColorStop(0, "rgba("+channel_color[channel]+", 0.5)");
                                gradient.addColorStop(1, "rgba("+channel_color[channel]+", 0)");
                                context.fillStyle = gradient;
                                context.fillRect(x1, y1-r, x2-x1, r);
                            }
                            if(y2 < stageend) {
                                var gradient = context.createRadialGradient(x, y2, 0, x, y2, r);
                                gradient.addColorStop(0, "rgba("+channel_color[channel]+", 0.5)");
                                gradient.addColorStop(1, "rgba("+channel_color[channel]+", 0)");
                                context.fillStyle = gradient;
                                context.fillRect(x1, y2, x2-x1, r);
                            }
                            if(y2 > y1) {
                                var gradient = context.createLinearGradient(x1, 0, x2, 0);
                                gradient.addColorStop(0, "rgba("+channel_color[channel]+", 0)");
                                gradient.addColorStop(0.5, "rgba("+channel_color[channel]+", 0.5)");
                                gradient.addColorStop(1, "rgba("+channel_color[channel]+", 0)");
                                context.fillStyle = gradient;
                                context.fillRect(x1, y1, x2-x1, y2-y1);
                            }
                        }
                    }
                }
    }
    context.restore();
}
function drawNoteHighlight(canvas, context, timestamp, progresspos, stagestart, stageend) {
    if(stagestart >= stageend)
        return;
    var slice = Math.max(Math.floor(timestamp/midiData.slicelen), 0);
    var nonce = getNonce();
    context.save();
    context.beginPath();
    context.rect(0, stagestart, canvas.width, stageend-stagestart);
    context.clip();
    context.globalAlpha = 1;
    for(var channel_index = 0; channel_index < 16; channel_index++) {
        var channel = channel_order[channel_index];
        if(!midiData.timeslice[channel])
            continue;
        if(midiData.timeslice[channel][slice])
            for(var idx = 0; idx < midiData.timeslice[channel][slice].length; idx++) {
                var note = midiData.timeslice[channel][slice][idx];
                if(note.flag != nonce) {
                    note.flag = nonce;
                    if(note.start < timestamp && note.end > timestamp && (note.end-note.start)*flowSpeed >= 4) {
                        var x  = Math.round(canvas.width*(note.note+0.5)/128);
                        var x1 = Math.ceil(canvas.width*(note.note-2)/128);
                        var x2 = Math.floor(canvas.width*(note.note+3)/128);
                        var r  = Math.ceil(canvas.width*5/256);
                        var y1 = Math.ceil(progresspos+(note.start-timestamp)*flowSpeed);
                        var y2 = Math.floor(progresspos+(note.end-timestamp)*flowSpeed);
                        if(y1 > stagestart) {
                            var gradient = context.createRadialGradient(x, y1, 0, x, y1, r);
                            gradient.addColorStop(0, "rgba("+channel_color[channel]+", 0.4)");
                            gradient.addColorStop(1, "rgba("+channel_color[channel]+", 0)");
                            context.fillStyle = gradient;
                            context.fillRect(x1, y1-r, x2-x1, r);
                        }
                        if(y2 < stageend) {
                            var gradient = context.createRadialGradient(x, y2, 0, x, y2, r);
                            gradient.addColorStop(0, "rgba("+channel_color[channel]+", 0.4)");
                            gradient.addColorStop(1, "rgba("+channel_color[channel]+", 0)");
                            context.fillStyle = gradient;
                            context.fillRect(x1, y2, x2-x1, r);
                        }
                        if(y2 > y1) {
                            var gradient = context.createLinearGradient(x1, 0, x2, 0);
                            gradient.addColorStop(0, "rgba("+channel_color[channel]+", 0)");
                            gradient.addColorStop(0.4, "rgba("+channel_color[channel]+", 0.4)");
                            gradient.addColorStop(0.41, "rgba("+channel_color[channel]+", 0)");
                            gradient.addColorStop(0.59, "rgba("+channel_color[channel]+", 0)");
                            gradient.addColorStop(0.6, "rgba("+channel_color[channel]+", 0.4)");
                            gradient.addColorStop(1, "rgba("+channel_color[channel]+", 0)");
                            context.fillStyle = gradient;
                            context.fillRect(x1, y1, x2-x1, y2-y1);
                        }
                    }
                }
            }
    }
    context.restore();
}
window.submitMidiData = function (midiData_) {
    midiData = midiData_;
};
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
function initVisual() {
    var player = document.getElementById("player");
    player.addEventListener("play", resumeVisual);
    player.addEventListener("pause", pauseVisual);
    player.addEventListener("timeupdate", refreshVisual);
    var visual = document.getElementById("visual");
    var pagefoot = document.getElementById("pagefoot");
    var resizefunc = function () {
        visual.dataScaleFactor = getCanvasPixelRatio(visual);
        visual.width = document.body.clientWidth * visual.dataScaleFactor;
        visual.height = pagefoot.offsetTop * visual.dataScaleFactor;
        visual.style.height = pagefoot.offsetTop + "px";
        refreshVisual();
    };
    window.addEventListener("resize", resizefunc);
    window.addEventListener("scroll", refreshVisual);
    resizefunc();
}
initVisual();
}());
