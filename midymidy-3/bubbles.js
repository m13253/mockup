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
function makeBubble() {
    var elBubbles = document.getElementById("bubbles");
    if(elBubbles.getElementsByClassName("bubble_item").length > 8) return false;

    var el = document.createElement("div");
    el.style.position = "fixed";
    el.style.zIndex = "-1";
    el.style.top = el.style.left = "0px";
    el.style.height = el.style.width = "64px";
    el.style.backgroundImage = "radial-gradient(ellipse at center, white 60%, rgba(255, 255, 255, 0) 70%)";

    var x = 100*Math.random();
    var y = 100*Math.random()+20;
    var r = 30*Math.random()+10;
    var dx = 20*Math.sqr(Math.random())-10;
    var dy = 20*Math.sqr(Math.random())-10-30;
    var dr = Math.min(10*Math.random()-5, r);
    var alpha = 0.25 - r*(r-dr)/8000;

    var x1 = calcViewportMetrics.vw(x);
    var y1 = calcViewportMetrics.vh(y);
    var r1 = calcViewportMetrics.vmin(r);
    var x2 = calcViewportMetrics.vw(x + dx);
    var y2 = calcViewportMetrics.vh(y + dy);
    var r2 = calcViewportMetrics.vmin(r + dr);
    el.style.opacity = "0";
    el.style.transform = "translate("+(x1-r1/2)+"px, "+(y1-r1/2)+"px) scale("+r1/64+") translateZ(0px)";

    elBubbles.appendChild(el);
    var el_computedStyle = getComputedStyle(el);
    el_computedStyle.opacity;
    el_computedStyle.transform;

    el.style.transition = "opacity 10s ease-in, transform 20s linear";
    el.style.opacity = alpha;
    el.style.transform = "translate("+(x2-r2/2)+"px, "+(y2-r2/2)+"px) scale("+r2/64+") translateZ(0px)";

    setTimeout(function () {
        el.style.transition = "opacity 10s ease-out, transform 20s linear";
        el.style.opacity = "0";
        setTimeout(function () {
            el.remove();
        }, 10000);
    }, 10000);

    el.classList.add("bubble_item");
    return true;
}
addEventListener("load", function () {
    if(window.requestAnimationFrame)
        requestAnimationFrame(function () {
            setInterval(makeBubble, 2000);
        });
});
