Math.sqr = function(x) { return x*x; };
window.calcViewportMetrics = {
    'vw': function(x) { return x ? document.body.clientWidth*x/100 : document.body.clientWidth/100; },
    'vh': function(x) { return x ? document.body.clientHeight*x/100 : document.body.clientHeight/100; },
    'vmax': function(x) { return Math.max(this.vw(x), this.vh(x)); },
    'vmin': function(x) { return Math.min(this.vw(x), this.vh(x)); }
};
function makeBubble() {
    var elBubbles = document.getElementById("bubbles");
    var el = document.createElement("div");
    el.bubbledata = {
        'frame': -1,
        'lifetime': 20000,
        'x': 100*Math.random(),
        'y': 100*Math.random(),
        'r': 30*Math.random()+10,
        'dx': 10*Math.random()-5,
        'dy': 10*Math.random()-5,
    };
    el.bubbledata.dr = Math.min(10*Math.random()-5, el.bubbledata.r);
    el.bubbledata.alpha = 0.5 - el.bubbledata.r*(el.bubbledata.r-el.bubbledata.dr)/4000;

    el.style.position = "absolute";
    el.style.height = el.style.width = "16px";
    el.style.backgroundColor = "white";
    el.style.borderRadius = "50%";
    el.style.boxShadow = "0px 0px 2px 2px white";
    elBubbles.appendChild(el);
    animateBubble(el);
    el.classList.add("bubble_item");
}
function animateBubble(el) {
    if((el.bubbledata.frame += 100) > el.bubbledata.lifetime)
        if(el.remove)
             el.remove()
        else
             el.parentNode.removeChild(el);
    else {
        var frame_lifetime = el.bubbledata.frame/el.bubbledata.lifetime;
        var x = calcViewportMetrics.vw(el.bubbledata.x+el.bubbledata.dx*frame_lifetime)-8;
        var y = calcViewportMetrics.vh(el.bubbledata.y+el.bubbledata.dy*frame_lifetime)-8;
        var r = calcViewportMetrics.vmin(el.bubbledata.r+el.bubbledata.dr*frame_lifetime)/16;
        var alpha = el.bubbledata.alpha*frame_lifetime*(1-frame_lifetime)*4;
        el.style.opacity = alpha;
        el.style.transform = el.style.webkitTransform = "translate3d("+x+"px, "+y+"px, 0px) scale("+r+")";
    }
}
function animateBubbles() {
    var elBubbles = document.getElementById("bubbles").getElementsByClassName("bubble_item");
    for(var i = 0; i < elBubbles.length; i++)
        animateBubble(elBubbles[i]);
    setTimeout(animateBubbles, 100)
}
addEventListener("load", function () {
    if(window.requestAnimationFrame)
        requestAnimationFrame(function () {
            setInterval(makeBubble, 2000);
            makeBubble();
            animateBubbles();
        });
});
