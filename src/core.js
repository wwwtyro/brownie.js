
var Brownie = function(renderer) {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.chunk = new Chunk();
        self.geometry = new THREE.BufferGeometry();
    };

    self.set = function(x, y, z, r, g, b) {
        self.chunk.set(x, y, z, r, g, b);
    };

    self.unset = function(x, y, z) {
        self.chunk.unset(x, y, z);
    };

    self.get = function(x, y, z) {
        return self.chunk.get(x, y, z);
    };

    self.getBounds = function() {
        return self.chunk.getBounds();
    };

    self.getCentroid = function() {
        return self.chunk.getCentroid();
    };

    self.rebuild = function() {
        var arrays = self.chunk.genArrays();
        self.geometry.dispose();
        self.geometry = new THREE.BufferGeometry();
        self.geometry.addAttribute('position', new THREE.BufferAttribute(arrays.positions, 3));
        self.geometry.addAttribute('normal', new THREE.BufferAttribute(arrays.normals, 3));
        self.geometry.addAttribute('color', new THREE.BufferAttribute(arrays.colors, 3));
        self.geometry.addAttribute('uv', new THREE.BufferAttribute(arrays.uvs, 2));
    };

    self.getGeometry = function() {
        return self.geometry;
    };

    self.toJSON = function() {
        // XXX: This needs to be refactored - should return JSON string, not object.
        var json = [];
        for (var i in self.chunk.voxels) {
            var v = self.chunk.voxels[i];
            json.push({
                x: v.x,
                y: v.y,
                z: v.z,
                r: Math.floor(v.r*1000)/1000,
                g: Math.floor(v.g*1000)/1000,
                b: Math.floor(v.b*1000)/1000
            });
        }
        return json;
    };

    self.fromJSON = function(json) {
        // XXX: This needs to be refactored - should take JSON string, not object.
        for (var i = 0; i < json.length; i++) {
            var v = json[i];
            self.chunk.set(v.x, v.y, v.z, v.r, v.g, v.b);
        }
    }

    self.dispose = function() {
        self.geometry.dispose();
    };

    self.initialize();
    
};