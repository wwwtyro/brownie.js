var Chunk = function() {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.voxels = {};
    };

    self.set = function(x, y, z, r, g, b) {
        self.voxels[[x, y, z]] = {
            x: x,
            y: y,
            z: z,
            r: r,
            g: g,
            b: b
        };
    };

    self.get = function(x, y, z) {
        return self.voxels[[x, y, z]];
    };

    self.unset = function(x, y, z) {
        delete self.voxels[[x, y, z]];
    }

    self.getBounds = function() {
        var bounds = {
            x: {
                min: 1e300,
                max: -1e300,
            },
            y: {
                min: 1e300,
                max: -1e300,
            },
            z: {
                min: 1e300,
                max: -1e300,
            }
        };
        var keys = Object.keys(self.voxels);
        for (var i = 0; i < keys.length; i++) {
            var v = self.voxels[keys[i]];
            bounds.x.min = Math.min(bounds.x.min, v.x);
            bounds.x.max = Math.max(bounds.x.max, v.x);
            bounds.y.min = Math.min(bounds.y.min, v.y);
            bounds.y.max = Math.max(bounds.y.max, v.y);
            bounds.z.min = Math.min(bounds.z.min, v.z);
            bounds.z.max = Math.max(bounds.z.max, v.z);
        }
        return bounds;
    };

    self.genArrays = function() {
        var aoleft = 0.5 * 1/(64 * 256);
        var aoright = 63.5 * 1/(64 * 256);
        var aoWidth = 1/256;
        var positions = [];
        var normals = [];
        var colors = [];
        var uvs = [];
        var keys = Object.keys(self.voxels);
        for (var i = 0; i < keys.length; i++) {
            var v = self.voxels[keys[i]];
            if (!([v.x, v.y, v.z + 1] in self.voxels)) {
                var ao0 = [v.x - 1, v.y - 1, v.z + 1] in self.voxels? 1 : 0;
                var ao1 = [v.x + 0, v.y - 1, v.z + 1] in self.voxels? 1 : 0;
                var ao2 = [v.x + 1, v.y - 1, v.z + 1] in self.voxels? 1 : 0;
                var ao3 = [v.x + 1, v.y + 0, v.z + 1] in self.voxels? 1 : 0;
                var ao4 = [v.x + 1, v.y + 1, v.z + 1] in self.voxels? 1 : 0;
                var ao5 = [v.x + 0, v.y + 1, v.z + 1] in self.voxels? 1 : 0;
                var ao6 = [v.x - 1, v.y + 1, v.z + 1] in self.voxels? 1 : 0;
                var ao7 = [v.x - 1, v.y + 0, v.z + 1] in self.voxels? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                positions.push.apply(positions, [
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 1, v.z + 1 
                ]);
                uvs.push.apply(uvs, [
                    aoWidth * aoIndex + aoleft,  0,
                    aoWidth * aoIndex + aoright, 0,
                    aoWidth * aoIndex + aoright, 1,
                    aoWidth * aoIndex + aoleft,  0,
                    aoWidth * aoIndex + aoright, 1,
                    aoWidth * aoIndex + aoleft,  1
                ]);
                colors.push.apply(colors, [
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                ]);
                normals.push.apply(normals, [
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
                ]);
            }
            if (!([v.x, v.y, v.z - 1] in self.voxels)) {
                positions.push.apply(positions, [
                    v.x + 1, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 1, v.z + 0
                ]);
                aoIndex = 0;
                uvs.push.apply(uvs, [
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 1,
                ]);
                normals.push.apply(normals, [
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1
                ]);
                colors.push.apply(colors, [
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b
                ]);
            }
            if (!([v.x - 1, v.y, v.z] in self.voxels)) {
                positions.push.apply(positions, [
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 1, v.z + 0,
                ]);
                aoIndex = 0;
                uvs.push.apply(uvs, [
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 1,
                ]);
                normals.push.apply(normals, [
                    -1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0
                ]);
                colors.push.apply(colors, [
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b
                ]);
            }
            if (!([v.x + 1, v.y, v.z] in self.voxels)) {
                positions.push.apply(positions, [
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 0, v.z + 0,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 1, v.z + 1
                ]);
                aoIndex = 0;
                uvs.push.apply(uvs, [
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 1,
                ]);
                normals.push.apply(normals, [
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0
                ]);
                colors.push.apply(colors, [
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b
                ]);
            }
            if (!([v.x, v.y + 1, v.z] in self.voxels)) {
                positions.push.apply(positions, [
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 0
                ]);
                aoIndex = 0;
                uvs.push.apply(uvs, [
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 1,
                ]);
                normals.push.apply(normals, [
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0
                ]);
                colors.push.apply(colors, [
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b
                ]);
            }
            if (!([v.x, v.y - 1, v.z] in self.voxels)) {
                positions.push.apply(positions, [
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 0,
                ]);
                aoIndex = 0;
                uvs.push.apply(uvs, [
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 0,
                    aoWidth * aoIndex + aoWidth, 1,
                    aoWidth * aoIndex, 1,
                ]);
                normals.push.apply(normals, [
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0
                ]);
                colors.push.apply(colors, [
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b,
                    v.r, v.g, v.b
                ]);
            }
        }
        return {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            colors: new Float32Array(colors),
            uvs: new Float32Array(uvs)
        };
    }



    self.initialize();

}