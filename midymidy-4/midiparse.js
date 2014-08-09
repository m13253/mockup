/*!
  @file midiparse.js
  @author StarBrilliant <m13253@hotmail.com>
  @license Commercial
*/
(function () {
window.loadMidi = function (url, onload, onerror, onprogress, onxhrready) {
    if(!onerror)
        onerror = function (err) { console.error(err); };
    var xhr;
    try {
        xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        if(onxhrready)
            onxhrready(xhr);
        xhr.addEventListener("load", function () {
            if(xhr.status != 200 && xhr.status != 206) {
                onerror({"err": "HTTP Error: "+xhr.status+" "+xhr.statusText, "xhr": xhr});
                return;
            }
            initMidiParse();
            parseMidiBuffer(new Uint8Array(xhr.response), 0, onload, onerror, onprogress);
        });
        xhr.send();
    } catch(e) {
        onerror({"err": e, "xhr": xhr});
    }
}
var midiData;
function initMidiParse() {
    midiData = {};
    midiData.timeslice = new Array();
    midiData.slicelen = 5;
    midiData.pending = {
        "setNote": function (channel, note, data) { this[(channel<<8) | note] = data; },
        "getNote": function (channel, note) { return this[(channel<<8) | note]; },
        "delNote": function (channel, note) { return delete this[(channel<<8) | note]; }
    };
    midiData.maxtime = 0;
}
function parseMidiBuffer(buf, offset, onload, onerror, onprogress) {
    if(offset < buf.length)
        setTimeout(function () {
            if(onprogress)
                onprogress({"lengthComputable": true, "loaded": offset, "total": buf.length});
            try {
                offset = parseMidiBufferCycle(buf, offset);
            } catch(e) {
                onerror({"err": e, "midiData": midiData});
                return;
            }
            parseMidiBuffer(buf, offset, onload, onerror, onprogress);
        }, 1);
    else {
        if(onprogress)
            onprogress({"lengthComputable": true, "loaded": buf.length, "total": buf.length});
        if(onload)
            onload(midiData);
    }
}
function parseMidiBufferCycle(buf, offset) {
    if(!(offset >= 0))
        throw "Assertion Error: offset >= 0";
    if(midiData.mthd === undefined) {
        offset = scanUntil(buf, [0x4d, 0x54, 0x68, 0x64], offset);
        if(offset == -1) {
            throw "Parse Error: Invalid MIDI file.";
            return;
        }
        midiData.mthd = {};
        midiData.mthd.len = scanInt(buf, offset, 4);
        midiData.mthd.trackType = scanInt(buf, offset+4, 2);
        midiData.mthd.trackCount = scanInt(buf, offset+6, 2);
        midiData.mthd.division = scanInt(buf, offset+8, 2);
        offset += midiData.mthd.len+4;
        midiData.tempo = {0: midiData.mthd.division*2};
        return offset;
    }
    while(offset != 1) {
        if(midiData.trackEnd === undefined) {
            offset = scanUntil(buf, [0x4d, 0x54, 0x72, 0x6b], offset);
            if(offset == -1)
                break;
            midiData.trackEnd = offset+scanInt(buf, offset, 4)+4;
            midiData.time = 0;
            midiData.meta = 0;
            offset += 4;
        }
        var notesCount = 0;
        while(offset != -1 && offset < midiData.trackEnd) {
            var tmpoffset = offset;
            var delta = scanBigint(buf, offset);
            if(delta[0] === undefined)
                break;
            midiData.time += delta[0];
            offset = delta[1];
            var meta = scanInt(buf, offset, 1);
            if(meta === undefined)
                break;
            if(meta&0x80) {
                midiData.meta = meta;
                offset++;
            } else
                meta = midiData.meta;
            if(meta == 0xff) {
                var cmd = scanInt(buf, offset, 1);
                var metalen = scanInt(buf, offset+1, 1);
                if(metalen === undefined)
                    break;
                offset += 2;
                switch(cmd) {
                case 0x51:
                    midiData.tempo[midiData.time] = midiData.mthd.division*1000000/scanInt(buf, offset, metalen);
                    break;
                }
                offset += metalen;
            } else {
                var channel = meta&0xf;
                var cmd = meta>>4;
                switch(cmd) {
                case 0x9:
                    var note=scanInt(buf, offset, 1)
                    var vel=scanInt(buf, offset+1, 1);
                    offset += 2;
                    noteon(delta2sec(midiData.time), channel, note, vel);
                    break;
                case 0x8:
                    var note=scanInt(buf, offset, 1)
                    var vel=scanInt(buf, offset+1, 1);
                    offset += 2;
                    noteoff(delta2sec(midiData.time), channel, note, vel);
                    break;
                case 0xa:
                case 0xb:
                case 0xe:
                    offset += 2;
                    break;
                case 0xc:
                case 0xd:
                    offset++;
                    break;
                }
            }
            if(++notesCount == 1024)
                return offset;
        }
        offset = midiData.trackEnd;
        midiData.trackEnd = undefined;
        return offset;
    }
    closeRemainingNotes();
}
function noteon(time, channel, note, vel) {
    noteoff(time, channel, note, 0);
    if(vel == 0)
        return;
    midiData.pending.setNote(channel, note, {
        "start":   time,
        "channel": channel,
        "note":    note,
        "vel":     vel,
        "flag":    0
    });
    midiData.maxtime = Math.max(midiData.maxtime, time);
}
function noteoff(time, channel, note, vel) {
    var noteData = midiData.pending.getNote(channel, note);
    if(noteData === undefined)
        return;
    midiData.pending.delNote(channel, note);
    if(noteData.start >= time)
        return;
    noteData.end = time;
    midiData.maxtime = Math.max(midiData.maxtime, time);
    var slice    = Math.floor(noteData.start/midiData.slicelen);
    var sliceend = Math.ceil(time/midiData.slicelen);
    for(; slice <= sliceend; slice++) {
        if(!midiData.timeslice[slice])
            midiData.timeslice[slice] = new Array();
        midiData.timeslice[slice].push(noteData);
    }
}
function closeRemainingNotes() {
    var maxtime = midiData.maxtime;
    for(var i in midiData.pending)
        if(midiData.pending[i].start !== undefined)
            noteoff(maxtime+3, i>>8, i&0xff, 0);
}
function delta2sec(delta) {
    var lastidx = 0;
    var total = 0;
    for(var i in midiData.tempo) {
        if(i >= delta)
            break;
        total += (i-lastidx)/midiData.tempo[lastidx];
        lastidx = i;
    }
    return total+(delta-lastidx)/midiData.tempo[lastidx];
}
function scanUntil(buffer, pattern, from) {
    var i;
    var patlen = pattern.length;
    var deltalen = buffer.length-patlen;
    for(; from <= deltalen; from++) {
        for(i = 0; i < patlen; i++)
            if(buffer[from+i] != pattern[i])
                break;
        if(i == patlen)
            return from+i;
    }
    return -1;
}
function scanInt(buffer, offset, len) {
    if(len == 0)
        return 0;
    var res = 0;
    for(var i = offset; i < offset+len; i++)
        if(buffer[i] === undefined)
            return;
        else
            res = (res<<8) | buffer[i];
    return res;
}
function scanBigint(buffer, offset) {
    var res = 0;
    while(buffer[offset] !== undefined) {
        res = (res<<7) | (buffer[offset]&0x7f);
        if(!(buffer[offset++]&0x80))
            return [res, offset];
    }
    return [undefined, offset];
}
}());
