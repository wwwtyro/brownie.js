"use strict";

var _queue = [];
var _queueSize = 1024;
var _frames = [{}];
var _frame = 0;

function _flushQueue() {
    postMessage(_queue);
    _queue = [];
}

function _postMessage(item) {
    _queue.push(item);
    if (_queue.length >= _queueSize) {
        _flushQueue();
    }
}

function set(x, y, z, r, g, b) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    _frames[_frame][[x, y, z]] = {
        x: x,
        y: y,
        z: z,
        r: r,
        g: g,
        b: b
    }
    _postMessage({
        command: "set",
        x: x,
        y: y,
        z: z,
        r: r,
        g: g,
        b: b
    });
}

function unset(x, y, z) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    delete _frames[_frame][[x, y, z]];
    _postMessage({
        command: "unset",
        x: x,
        y: y,
        z: z
    });
}

function get(x, y, z) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    return _frames[_frame][[x, y, z]];
}

function clear() {
    _frames[_frame] = {};
    _postMessage({
        command: "clear"
    });
}

function setCamera(angle, elevation, radius, x, y, z) {
    _postMessage({
        command: "set camera",
        angle: angle,
        elevation: elevation,
        radius: radius,
        x: x,
        y: y,
        z: z
    });
}

function addFrame() {
    _frames.push({});
    _postMessage({
        command: "add frame"
    });
}

function setFrame(n) {
    _frame = n;
    _postMessage({
        command: "set frame",
        n: n
    });
}

onmessage = function(e) {
    var msg = e.data;
    if (msg.command == "run") {
        (function program() {
            eval(msg.program);
        })();
    } else if (msg.command == "clear") {
        clear();
    }
    _flushQueue();
}