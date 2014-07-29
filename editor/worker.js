
"use strict";

var voxels = {};

function set(x, y, z, r, g, b) {
    voxels[[x, y, z]] = {
        x: x,
        y: y,
        z: z,
        r: r,
        g: g,
        b: b
    }
    postMessage({
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
    delete voxels[[x, y, z]];
    postMessage({
        command: "unset",
        x: x,
        y: y,
        z: z
    });
}

function get(x, y, z) {
    return voxels[[x, y, z]];
}

function clear() {
    voxels = {};
    postMessage({
        command: "clear"
    });
}

function setCamera(angle, elevation, radius, x, y, z) {
    postMessage({
        command: "set camera",
        angle: angle,
        elevation: elevation,
        radius: radius,
        x: x,
        y: y,
        z: z
    });
}

onmessage = function (e) {
    var msg = e.data;
    if (msg.command == "run") {
        (function program() {
            eval(msg.program);
        })();
    } else if (msg.command == "clear") {
        clear();
    }
}