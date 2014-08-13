var VoxelManager = function() {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.voxels = {};
        self.dirty = [];
        self.qm = new QuadManager();
    };

    self.markDirty = function(x, y, z) {
        if (self.voxels[[x + 0, y + 0, z + 0]]) self.dirty.push([x + 0, y + 0, z + 0]);
        if (self.voxels[[x + 0, y + 1, z + 0]]) self.dirty.push([x + 0, y + 1, z + 0]);
        if (self.voxels[[x + 0, y - 1, z + 0]]) self.dirty.push([x + 0, y - 1, z + 0]);
        if (self.voxels[[x + 0, y + 0, z + 1]]) self.dirty.push([x + 0, y + 0, z + 1]);
        if (self.voxels[[x + 0, y + 0, z - 1]]) self.dirty.push([x + 0, y + 0, z - 1]);
        if (self.voxels[[x + 1, y + 0, z + 0]]) self.dirty.push([x + 1, y + 0, z + 0]);
        if (self.voxels[[x - 1, y + 0, z + 0]]) self.dirty.push([x - 1, y + 0, z + 0]);
    };

    self.set = function(x, y, z, r, g, b) {
        if (self.voxels[[x, y, z]]) {
            self.qm.releaseQuads(self.voxels[[x, y, z]].quads);
        }
        self.voxels[[x, y, z]] = {
            x: x,
            y: y,
            z: z,
            r: r,
            g: g,
            b: b,
            quads: []
        };
        self.markDirty(x, y, z);
    };

    self.get = function(x, y, z) {
        return self.voxels[[x, y, z]];
    };

    self.unset = function(x, y, z) {
        if (self.voxels[[x, y, z]]) {
            self.qm.releaseQuads(self.voxels[[x, y, z]].quads);
        }
        delete self.voxels[[x, y, z]];
        self.markDirty(x, y, z);
    };

    self.buildQuad = function(v, face) {
        var index = self.qm.reserveQuad();
        var normal = VoxelVectors[face].normal;
        var up = VoxelVectors[face].up;
        var right = VoxelVectors[face].right;
        var a = [
            0.5 + v.x - right.x * 0.5 - up.x * 0.5 + normal.x * 0.5,
            0.5 + v.y - right.y * 0.5 - up.y * 0.5 + normal.y * 0.5,
            0.5 + v.z - right.z * 0.5 - up.z * 0.5 + normal.z * 0.5,
        ];
        var b = [
            0.5 + v.x + right.x * 0.5 - up.x * 0.5 + normal.x * 0.5,
            0.5 + v.y + right.y * 0.5 - up.y * 0.5 + normal.y * 0.5,
            0.5 + v.z + right.z * 0.5 - up.z * 0.5 + normal.z * 0.5,
        ];
        var c = [
            0.5 + v.x + right.x * 0.5 + up.x * 0.5 + normal.x * 0.5,
            0.5 + v.y + right.y * 0.5 + up.y * 0.5 + normal.y * 0.5,
            0.5 + v.z + right.z * 0.5 + up.z * 0.5 + normal.z * 0.5,
        ];
        var d = [
            0.5 + v.x - right.x * 0.5 + up.x * 0.5 + normal.x * 0.5,
            0.5 + v.y - right.y * 0.5 + up.y * 0.5 + normal.y * 0.5,
            0.5 + v.z - right.z * 0.5 + up.z * 0.5 + normal.z * 0.5,
        ];
        self.qm.setQuad(index, a, b, c, d, [normal.x, normal.y, normal.z], [v.r, v.g, v.b]);
        return index;
    };

    self.rebuild = function() {
        for (var key in self.dirty) {
            var v = self.voxels[self.dirty[key]];
            if (v == undefined) {
                continue;
            }
            self.qm.releaseQuads(v.quads);
            v.quads = [];
            v.positions = [];
            v.colors = [];
            v.normals = [];
            if (self.get(v.x + 0, v.y + 0, v.z + 1) == undefined) v.quads.push(self.buildQuad(v, "back"));
            if (self.get(v.x + 0, v.y + 0, v.z - 1) == undefined) v.quads.push(self.buildQuad(v, "front"));
            if (self.get(v.x - 1, v.y + 0, v.z + 0) == undefined) v.quads.push(self.buildQuad(v, "left"));
            if (self.get(v.x + 1, v.y + 0, v.z + 0) == undefined) v.quads.push(self.buildQuad(v, "right"));
            if (self.get(v.x + 0, v.y + 1, v.z + 0) == undefined) v.quads.push(self.buildQuad(v, "top"));
            if (self.get(v.x + 0, v.y - 1, v.z + 0) == undefined) v.quads.push(self.buildQuad(v, "bottom"));
        }
        self.dirty = [];
    };

    self.getUpdates = function() {
        return self.qm.getUpdates();
    };

    self.getBounds = function() {
        var bounds = {
            min: {
                x: 1e300,
                y: 1e300,
                z: 1e300
            },
            max: {
                x: -1e300,
                y: -1e300,
                z: -1e300
            }
        };
        for (var key in self.voxels) {
            var v = self.voxels[key];
            bounds.min.x = Math.min(bounds.min.x, v.x);
            bounds.min.y = Math.min(bounds.min.y, v.y);
            bounds.min.z = Math.min(bounds.min.z, v.z);
            bounds.max.x = Math.max(bounds.max.x, v.x + 1);
            bounds.max.y = Math.max(bounds.max.y, v.y + 1);
            bounds.max.z = Math.max(bounds.max.z, v.z + 1);
        }
        return bounds;
    };

    self.getCentroid = function() {
        var b = self.getBounds();
        return {
            x: (b.min.x + b.max.x)/2,
            y: (b.min.y + b.max.y)/2,
            z: (b.min.z + b.max.z)/2
        };
    };

    self.toJSON = function() {
        // XXX: This needs to be refactored - should return JSON string, not object.
        var voxels = self.voxels;
        var json = [];
        for (var i in voxels) {
            var v = voxels[i];
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
            self.set(v.x, v.y, v.z, v.r, v.g, v.b);
        }
    }

    self.initialize();

};


var VoxelVectors = {
    back: {
        normal: {
            x: 0,
            y: 0,
            z: 1
        },
        up: {
            x: 0,
            y: 1,
            z: 0
        },
        right: {
            x: 1,
            y: 0,
            z: 0
        }
    },
    front: {
        normal: {
            x: 0,
            y: 0,
            z: -1
        },
        up: {
            x: 0,
            y: 1,
            z: 0
        },
        right: {
            x: -1,
            y: 0,
            z: 0
        }

    },
    left: {
        normal: {
            x: -1,
            y: 0,
            z: 0
        },
        up: {
            x: 0,
            y: 1,
            z: 0
        },
        right: {
            x: 0,
            y: 0,
            z: 1
        }

    },
    right: {
        normal: {
            x: 1,
            y: 0,
            z: 0
        },
        up: {
            x: 0,
            y: 1,
            z: 0
        },
        right: {
            x: 0,
            y: 0,
            z: -1
        }

    },
    top: {
        normal: {
            x: 0,
            y: 1,
            z: 0
        },
        up: {
            x: 0,
            y: 0,
            z: -1
        },
        right: {
            x: 1,
            y: 0,
            z: 0
        }

    },
    bottom: {
        normal: {
            x: 0,
            y: -1,
            z: 0
        },
        up: {
            x: 0,
            y: 0,
            z: -1
        },
        right: {
            x: -1,
            y: 0,
            z: 0
        }
    }
};