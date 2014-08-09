/*!
  @file bubbles.js
  @author StarBrilliant <m13253@hotmail.com>
  @license AGPL version 3
*/
(function () {
Math.sqr = function (x) { return x*x; };
window.calcViewportMetrics = {
    'vw': function (x) { return document.body.clientWidth*x/100; },
    'vh': function (x) { return document.body.clientHeight*x/100; },
    'vmax': function (x) { return Math.max(document.body.clientWidth, document.body.clientHeight)*x/100; },
    'vmin': function (x) { return Math.min(document.body.clientWidth, document.body.clientHeight)*x/100; }
};
function requestDelayedAnimationFrame(func, delay) {
    if(!window.requestAnimationFrame)
        return false;
    if(delay < 17)
        return requestAnimationFrame(func);
    else
        return setTimeout(function () {
            requestAnimationFrame(func);
        }, delay-16);
}

var bubble_item = new Array();
var bubble_recycle = new Array();
function makeBubble(ts) {
    if(bubble_item.length > 10) {
        requestDelayedAnimationFrame(makeBubble, 2000);
        return false;
    }
    var elBubbles = document.getElementById("bubbles");
    var el = bubble_recycle.pop();
    if(el) {
        el.style.visibility = "visible";
    } else {
        el = document.createElement("div");
        el.style.position = "fixed";
        el.style.zIndex = "-1";
        el.style.top = el.style.left = "0px";
        el.style.height = el.style.width = "64px";
        el.style.backgroundImage = "radial-gradient(circle at center, white 60%, rgba(255, 255, 255, 0) 70%)";
        elBubbles.appendChild(el);
    }

    el.bubbledata = {
        'birthtime': ts,
        'lifetime': 20000,
        'x': 100*Math.random(),
        'y': 100*Math.random()+20,
        'r': 30*Math.random()+20,
        'dx': 20*Math.sqr(Math.random())-10,
        'dy': 20*Math.sqr(Math.random())-10-30,
    };
    el.bubbledata.dr = Math.min(20*Math.random()-10, el.bubbledata.r);
    el.bubbledata.alpha = Math.max(0.25 - el.bubbledata.r*(el.bubbledata.r-el.bubbledata.dr)/10000, 0.05);

    animateBubble(bubble_item.push(el)-1, ts);
    requestDelayedAnimationFrame(makeBubble, 2000);
    return true;
}
function animateBubble(idx, ts) {
    var el = bubble_item[idx];
    var progress = (ts-el.bubbledata.birthtime)/el.bubbledata.lifetime;
    if(progress > 1) {
        bubble_item.splice(idx, 1);
        el.style.visibility = "hidden";
        bubble_recycle.push(el);
        return false;
    }
    var x = calcViewportMetrics.vw(el.bubbledata.x+el.bubbledata.dx*progress);
    var y = calcViewportMetrics.vh(el.bubbledata.y+el.bubbledata.dy*progress);
    var r = calcViewportMetrics.vmin(el.bubbledata.r+el.bubbledata.dr*progress);
    var alpha = el.bubbledata.alpha*progress*(1-progress)*4;
    el.style.opacity = alpha;
    el.style.transform = el.style.webkitTransform = "translate("+(x-r/2)+"px, "+(y-r/2)+"px) scale("+r/64+") translateZ(0px)";
    return true;
}
function animateBubbles(ts) {
    for(var i = 0; i < bubble_item.length; i++)
        if(!animateBubble(i, ts))
            i--;
    requestDelayedAnimationFrame(animateBubbles, 100); /* Firefox can not even run at 25fps!!! */
}
window.addEventListener("load", function () {
    requestDelayedAnimationFrame(function (ts) {
        makeBubble(ts);
        animateBubbles(ts);
    }, 100);
});
}());
