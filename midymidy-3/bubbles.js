/*!
  @file bubbles.js
  @author StarBrilliant <m13253@hotmail.com>
  @license AGPL version 3
*/
Math.sqr = function(x) { return x*x; };
window.calcViewportMetrics = {
    'vw': function(x) { return x !== undefined ? document.body.clientWidth*x/100 : document.body.clientWidth/100; },
    'vh': function(x) { return x !== undefined ? document.body.clientHeight*x/100 : document.body.clientHeight/100; },
    'vmax': function(x) { return Math.max(this.vw(x), this.vh(x)); },
    'vmin': function(x) { return Math.min(this.vw(x), this.vh(x)); }
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
function makeBubble(ts) {
    var elBubbles = document.getElementById("bubbles");
    if(elBubbles.getElementsByClassName("bubble_item").length > 10) {
        requestDelayedAnimationFrame(makeBubble, 2000);
        return false;
    }
    var el = document.createElement("div");
    el.bubbledata = {
        'birthtime': ts,
        'lifetime': 20000,
        'x': 100*Math.random(),
        'y': 100*Math.random()+20,
        'r': 30*Math.random()+10,
        'dx': 20*Math.sqr(Math.random())-10,
        'dy': 20*Math.sqr(Math.random())-10-30,
    };
    el.bubbledata.dr = Math.min(10*Math.random()-5, el.bubbledata.r);
    el.bubbledata.alpha = 0.25 - el.bubbledata.r*(el.bubbledata.r-el.bubbledata.dr)/4000;

    el.style.position = "fixed";
    el.style.zIndex = "-1";
    el.style.top = el.style.left = "0px";
    el.style.height = el.style.width = "64px";
    el.style.backgroundImage = "radial-gradient(circle at center, white 60%, rgba(255, 255, 255, 0) 70%)";
    elBubbles.appendChild(el);
    animateBubble(el, ts);
    el.classList.add("bubble_item");
    requestDelayedAnimationFrame(makeBubble, 2000);
    return true;
}
function animateBubble(el, ts) {
    if(ts > el.bubbledata.birthtime + el.bubbledata.lifetime) {
        if(el.remove)
             el.remove()
        else
             el.parentNode.removeChild(el);
        return false;
    }
    var progress = (ts-el.bubbledata.birthtime)/el.bubbledata.lifetime;
    var x = calcViewportMetrics.vw(el.bubbledata.x+el.bubbledata.dx*progress);
    var y = calcViewportMetrics.vh(el.bubbledata.y+el.bubbledata.dy*progress);
    var r = calcViewportMetrics.vmin(el.bubbledata.r+el.bubbledata.dr*progress);
    var alpha = el.bubbledata.alpha*progress*(1-progress)*4;
    el.style.opacity = alpha;
    el.style.transform = el.style.webkitTransform = "translate("+(x-r/2)+"px, "+(y-r/2)+"px) scale("+r/64+") translateZ(0px)";
    return true;
}
function animateBubbles(ts) {
    var elBubbles = document.getElementById("bubbles").getElementsByClassName("bubble_item");
    for(var i = 0; i < elBubbles.length; i++)
        animateBubble(elBubbles[i], ts);
    requestDelayedAnimationFrame(animateBubbles, 100); /* Firefox can not even run at 25fps!!! */
}
window.addEventListener("load", function () {
    requestDelayedAnimationFrame(function (ts) {
        makeBubble(ts);
        animateBubbles(ts);
    }, 100);
});
