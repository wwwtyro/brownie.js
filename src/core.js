
var Brownie = function() {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.chunk = new Chunk();
        self.geometry = new THREE.BufferGeometry();
        var a3 = new Float32Array([1,1,1,1,1,1,1,1,1]);
        var a2 = new Float32Array([1,1,1,1,1,1]);
        self.geometry.addAttribute('position', new THREE.BufferAttribute(a3, 3));
        self.geometry.addAttribute('normal', new THREE.BufferAttribute(a3, 3));
        self.geometry.addAttribute('color', new THREE.BufferAttribute(a3, 3));
        self.geometry.addAttribute('uv', new THREE.BufferAttribute(a2, 2));
        self.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);
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
        self.geometry.attributes.position.array = arrays.positions;
        self.geometry.attributes.normal.array = arrays.normals;
        self.geometry.attributes.color.array = arrays.colors;
        self.geometry.attributes.uv.array = arrays.uvs;
        self.geometry.attributes.position.needsUpdate = true;
        self.geometry.attributes.normal.needsUpdate = true;
        self.geometry.attributes.color.needsUpdate = true;
        self.geometry.attributes.uv.needsUpdate = true;
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

    self.blit = function(source, x, y, z) {
        for (var k in source.chunk.voxels) {
            var v = source.chunk.voxels[k];
            self.set(v.x + x, v.y + y, v.z + z, v.r, v.g, v.b);
        }
    }

    self.initialize();
    
}; 

