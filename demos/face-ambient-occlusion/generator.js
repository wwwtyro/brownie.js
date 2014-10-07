"use strict";

var fs = require("fs");

function read(f) {
  return fs.readFileSync(f).toString();
}

function include(f) {
  eval.apply(global, [read(f)]);
}

include("../../src/random.js");
include("../../src/raycast.js");
include("../../src/chunk.js");

var size = 32;

var chunk = new Chunk();

for (var x = -size/2; x < size + size/2; x++) {
    for (var z = -size/2; z < size + size/2; z++) {
        chunk.set(x, -1, z, 1, 1, 1);
    }
}

for (var i = 0; i < size * size * size/16; i++) {
    var x = Math.floor(Math.random() * size);
    var y = Math.floor(Math.random() * size);
    var z = Math.floor(Math.random() * size);
    chunk.set(x, y, z, 0, 0.5, 1.0);
}

chunk.calculateAO(100, size, 1.0, function(p) {
    console.error(p);
});

for (var i = 0; i < 2; i++) {
    chunk.antialiasAO();
}

console.log(JSON.stringify(chunk.voxels));