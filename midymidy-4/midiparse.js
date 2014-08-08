/*!
  @file bubbles.js
  @author StarBrilliant <m13253@hotmail.com>
  @license AGPL version 3
*/
(function () {
window.loadMidi = function (url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener("load", function () {
        parseMidiBuffer(new Uint8Array(xhr.response));
    });
    xhr.send();
}
function parseMidiBuffer(buf) {
    console.log(buf);
}
}());
