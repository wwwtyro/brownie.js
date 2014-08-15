var Brownie = function(renderer) {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.vm = new VoxelManager();
        self.gm = new GeometryManager(renderer.getContext())
    };

    self.set = function(x, y, z, r, g, b) {
        self.vm.set(x, y, z, r, g, b);
    };

    self.unset = function(x, y, z, r, g, b) {
        self.vm.unset(x, y, z, r, g, b);
    };

    self.get = function(x, y, z) {
        return self.vm.get(x, y, z);
    };

    self.getBounds = function() {
        return self.vm.getBounds();
    };

    self.getCentroid = function() {
        return self.vm.getCentroid();
    };

    self.rebuild = function() {
        self.vm.rebuild();
        var updates = self.vm.getUpdates();
        self.gm.rebuild(updates);
    };

    self.getGeometry = function() {
        return self.gm.geometry;
    };

    self.toJSON = function() {
        return self.vm.toJSON();
    };

    self.fromJSON = function(json) {
        self.vm.fromJSON(json);
    }

    self.dispose = function() {
        self.gm.dispose();
    };

    self.initialize();
    
};

var GeometryManager = function(glContext) {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.gl = glContext;
        self.geometry = new THREE.BufferGeometry();
        self.geometry.addAttribute('position', new THREE.Float32Attribute(0, 3));
        self.geometry.addAttribute('normal', new THREE.Float32Attribute(0, 3));
        self.geometry.addAttribute('color', new THREE.Float32Attribute(0, 3));
        self.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);
    }

    self.dispose = function() {
        self.geometry.dispose();
    }

    self.updateAttribute = function(attrib) {
        self.gl.deleteBuffer(attrib.buffer);
        attrib.buffer = self.gl.createBuffer();
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, attrib.buffer);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, attrib.array, self.gl.DYNAMIC_DRAW);
    }

    self.updateAttributeBuffer = function(attrib, updates) {
        for (var i = 0; i < updates.length; i++) {
            var l = updates[i][0];
            var r = updates[i][1];
            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, attrib.buffer);
            var view = attrib.array.subarray(l, r);
            self.gl.bufferSubData(self.gl.ARRAY_BUFFER, l * attrib.array.BYTES_PER_ELEMENT, view);
        }
    }

    self.rebuild = function(updates) {
        var position = self.geometry.attributes.position;
        if (position.array != updates.positions) {
            position.array = updates.positions;
            self.updateAttribute(position);
        } else {
            self.updateAttributeBuffer(position, updates.updates);
        }
        var normal = self.geometry.attributes.normal;
        if (normal.array != updates.normals) {
            normal.array = updates.normals;
            self.updateAttribute(normal);
        } else {
            self.updateAttributeBuffer(normal, updates.updates);
        }
        var color = self.geometry.attributes.color;
        if (color.array != updates.colors) {
            color.array = updates.colors;
            self.updateAttribute(color);
        } else {
            self.updateAttributeBuffer(color, updates.updates);
        }
    }

    self.initialize();

}

var QuadManager = function() {

    "use strict";

    var self = this;
    var GROWTH_SIZE = 1024;

    self.initialize = function() {
        self.updates = [];
        self.size = 0;
        self.unused = [];
        self.positions = undefined;
        self.normals = undefined;
        self.colors = undefined;
        self.grow();
    };

    self.reserveQuad = function() {
        if (self.unused.length == 0) {
            self.grow();
        }
        return self.unused.pop();
    };

    self.releaseQuad = function(index) {
        var big = [1e38, 1e38, 1e38];
        var one = [1, 1, 1];
        self.setQuad(index, big, big, big, big, one, one);
        self.unused.push(index);
    };

    self.releaseQuads = function(indices) {
        for (var i in indices) {
            self.releaseQuad(indices[i]);
        }
    };

    self.grow = function() {
        var newSize = self.size + GROWTH_SIZE;
        var newPositions = new Float32Array(newSize * 18);
        var newNormals = new Float32Array(newSize * 18);
        var newColors = new Float32Array(newSize * 18);
        if (self.positions) {
            newPositions.set(self.positions);
        }
        if (self.normals) {
            newNormals.set(self.normals);
        }
        if (self.colors) {
            newColors.set(self.colors);
        }
        self.positions = newPositions;
        self.normals = newNormals;
        self.colors = newColors;
        for (var i = self.size; i < newSize; i++) {
            self.releaseQuad(i);
        }
        self.size = newSize;
    };

    self.setQuad = function(index, a, b, c, d, normal, color) {
        var pi = index * 18;
        var ni = index * 18;
        var ci = index * 18;
        self.positions.set(a, pi + 0);
        self.positions.set(b, pi + 3);
        self.positions.set(c, pi + 6);
        self.positions.set(a, pi + 9);
        self.positions.set(c, pi + 12);
        self.positions.set(d, pi + 15);
        self.normals.set(normal, ni + 0);
        self.normals.set(normal, ni + 3);
        self.normals.set(normal, ni + 6);
        self.normals.set(normal, ni + 9);
        self.normals.set(normal, ni + 12);
        self.normals.set(normal, ni + 15);
        self.colors.set(color, ci + 0);
        self.colors.set(color, ci + 3);
        self.colors.set(color, ci + 6);
        self.colors.set(color, ci + 9);
        self.colors.set(color, ci + 12);
        self.colors.set(color, ci + 15);
        self.updates.push([pi, pi+19]);
    };

    self.mergeUpdates = function() {
        if (self.updates.length == 0) {
            return;
        }
        self.updates.sort(function(a, b) {
            return a[0] - b[0]
        });
        var j = 0;
        var newUpdates = [self.updates[0]];
        for (var i = 1; i < self.updates.length; i++) {
            if (self.updates[i][0] <= newUpdates[j][1] + 1) {
                newUpdates[j][1] = Math.max(newUpdates[j][1], self.updates[i][1]);
            } else {
                newUpdates.push(self.updates[i]);
                j++;
            }
        }
        self.updates = newUpdates;
    };

    self.getUpdates = function() {
        self.mergeUpdates();
        return {
            updates: self.updates,
            positions: self.positions,
            normals: self.normals,
            colors: self.colors
        }
        self.updates = [];
    };

    self.toJSON = function() {
        var positions = [];
        var normals = [];
        var colors = [];
        for (var i = 0; i < self.size; i++) {
            if (!(i in self.unused)) {
                positions.push.apply(positions, self.positions.subarray(i*18, i*18+19))
                normals.push.apply(normals, self.normals.subarray(i*18, i*18+19))
                colors.push.apply(colors, self.colors.subarray(i*18, i*18+19))
            }
        }
        return {
            positions: positions,
            normals: normals,
            colors: colors
        }
    }

    self.initialize();

}

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