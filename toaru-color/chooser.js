'use strict';

(() => {

    let currentLch = [74, 40, 270];

    function repaintTone() {
        let toneCanvas = document.getElementById('tone-canvas');
        let ctx = toneCanvas.getContext('2d');
        let imageData = ctx.createImageData(toneCanvas.width, toneCanvas.height);
        for(let i = 0; i < imageData.height; ++i) {
            for(let j = 0; j < imageData.width; ++j) {
                let [l, c, h] = [100 - 100 * i / (imageData.height+1), 100 - 100 * j / (imageData.width+1), currentLch[2]];
                let [r, g, b] = ToaruConverter.Lch_sRGB(l, c, h);
                if(r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0) {
                    r = g = b = 0xbc;
                }
                imageData.data[(i * imageData.width + j) * 4] = r;
                imageData.data[(i * imageData.width + j) * 4 + 1] = g;
                imageData.data[(i * imageData.width + j) * 4 + 2] = b;
                imageData.data[(i * imageData.width + j) * 4 + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function repaintHue() {
        let hueCanvas = document.getElementById('hue-canvas');
        let ctx = hueCanvas.getContext('2d');
        let imageData = ctx.createImageData(hueCanvas.width, hueCanvas.height);
        for(let i = 0; i < imageData.height; ++i) {
            let [l, c, h] = [74, 40, 360 - 360 * i / (imageData.height+1)];
            let [r, g, b] = ToaruConverter.Lch_sRGB(l, c, h);
            if(r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0) {
                r = g = b = 0xbc;
            }
            for(let j = 0; j < imageData.width; ++j) {
                imageData.data[(i * imageData.width + j) * 4] = r;
                imageData.data[(i * imageData.width + j) * 4 + 1] = g;
                imageData.data[(i * imageData.width + j) * 4 + 2] = b;
                imageData.data[(i * imageData.width + j) * 4 + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.beginPath();
        ctx.moveTo(0, (360-currentLch[2]) * (hueCanvas.height+1) / 360);
        ctx.lineTo(hueCanvas.width, (360-currentLch[2]) * (hueCanvas.height+1) / 360);
        ctx.stroke();
    }

    function bindEvent() {
        let hueCanvas = document.getElementById('hue-canvas');
        let eventHandler = (e) => {
            if(e.which == 1) {
                currentLch[2] = 360 - 360 * e.offsetY / (hueCanvas.height+1);
                repaintHue();
                repaintTone();
            }
        }
        hueCanvas.addEventListener('mousedown', eventHandler);
        hueCanvas.addEventListener('mousemove', eventHandler);
        hueCanvas.addEventListener('mouseup', eventHandler);
    }

    document.addEventListener('DOMContentLoaded', () => {
        repaintHue();
        repaintTone();
        bindEvent();
    });


})();
