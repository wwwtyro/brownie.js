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
            b: b,
            ao: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                back: 0,
                front: 0
            }
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
            x: (b.min.x + b.max.x) / 2,
            y: (b.min.y + b.max.y) / 2,
            z: (b.min.z + b.max.z) / 2
        };
    };

    self.genUVs = function(aoIndex) {
        var x0 = ((aoIndex % 16) * 64 + 0.5) / 1024;
        var y0 = 1 - (Math.floor(aoIndex / 16) * 64 + 0.5) / 1024;
        var x1 = ((aoIndex % 16) * 64 + 63.5) / 1024;
        var y1 = 1 - (Math.floor(aoIndex / 16) * 64 + 63.5) / 1024;
        return [
            x0, y1,
            x1, y1,
            x1, y0,
            x0, y1,
            x1, y0,
            x0, y0
        ];
    }

    self.genArrays = function() {
        var aoleft = 0.5 * 1 / (64 * 256);
        var aoright = 63.5 * 1 / (64 * 256);
        var aoWidth = 1 / 256;
        var positions = [];
        var normals = [];
        var colors = [];
        var uvs = [];
        var keys = Object.keys(self.voxels);
        for (var i = 0; i < keys.length; i++) {
            var v = self.voxels[keys[i]];
            if (!([v.x, v.y, v.z + 1] in self.voxels)) {
                var ao0 = [v.x - 1, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao1 = [v.x + 0, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao2 = [v.x + 1, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao3 = [v.x + 1, v.y + 0, v.z + 1] in self.voxels ? 1 : 0;
                var ao4 = [v.x + 1, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao5 = [v.x + 0, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao6 = [v.x - 1, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao7 = [v.x - 1, v.y + 0, v.z + 1] in self.voxels ? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                uvs.push.apply(uvs, self.genUVs(aoIndex));
                positions.push.apply(positions, [
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 1, v.z + 1
                ]);
                var aoFactor = 1 - v.ao.back;
                colors.push.apply(colors, [
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
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
                var ao0 = [v.x + 1, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao1 = [v.x + 0, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao2 = [v.x - 1, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao3 = [v.x - 1, v.y + 0, v.z - 1] in self.voxels ? 1 : 0;
                var ao4 = [v.x - 1, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao5 = [v.x + 0, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao6 = [v.x + 1, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao7 = [v.x + 1, v.y + 0, v.z - 1] in self.voxels ? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                uvs.push.apply(uvs, self.genUVs(aoIndex));
                positions.push.apply(positions, [
                    v.x + 1, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 1, v.z + 0
                ]);
                normals.push.apply(normals, [
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1
                ]);
                var aoFactor = 1 - v.ao.front;
                colors.push.apply(colors, [
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                ]);
            }
            if (!([v.x - 1, v.y, v.z] in self.voxels)) {
                var ao0 = [v.x - 1, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao1 = [v.x - 1, v.y - 1, v.z + 0] in self.voxels ? 1 : 0;
                var ao2 = [v.x - 1, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao3 = [v.x - 1, v.y + 0, v.z + 1] in self.voxels ? 1 : 0;
                var ao4 = [v.x - 1, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao5 = [v.x - 1, v.y + 1, v.z + 0] in self.voxels ? 1 : 0;
                var ao6 = [v.x - 1, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao7 = [v.x - 1, v.y + 0, v.z - 1] in self.voxels ? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                uvs.push.apply(uvs, self.genUVs(aoIndex));
                positions.push.apply(positions, [
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 0, v.y + 1, v.z + 0,
                ]);
                normals.push.apply(normals, [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0]);
                var aoFactor = 1 - v.ao.left;
                colors.push.apply(colors, [
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                ]);
            }
            if (!([v.x + 1, v.y, v.z] in self.voxels)) {
                var ao0 = [v.x + 1, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao1 = [v.x + 1, v.y - 1, v.z + 0] in self.voxels ? 1 : 0;
                var ao2 = [v.x + 1, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao3 = [v.x + 1, v.y + 0, v.z - 1] in self.voxels ? 1 : 0;
                var ao4 = [v.x + 1, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao5 = [v.x + 1, v.y + 1, v.z + 0] in self.voxels ? 1 : 0;
                var ao6 = [v.x + 1, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao7 = [v.x + 1, v.y + 0, v.z + 1] in self.voxels ? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                uvs.push.apply(uvs, self.genUVs(aoIndex));
                positions.push.apply(positions, [
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 0, v.z + 0,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 1, v.y + 1, v.z + 1
                ]);
                normals.push.apply(normals, [
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0
                ]);
                var aoFactor = 1 - v.ao.right;
                colors.push.apply(colors, [
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                ]);
            }
            if (!([v.x, v.y + 1, v.z] in self.voxels)) {
                var ao0 = [v.x - 1, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao1 = [v.x + 0, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao2 = [v.x + 1, v.y + 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao3 = [v.x + 1, v.y + 1, v.z + 0] in self.voxels ? 1 : 0;
                var ao4 = [v.x + 1, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao5 = [v.x + 0, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao6 = [v.x - 1, v.y + 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao7 = [v.x - 1, v.y + 1, v.z + 0] in self.voxels ? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                uvs.push.apply(uvs, self.genUVs(aoIndex));
                positions.push.apply(positions, [
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 1,
                    v.x + 1, v.y + 1, v.z + 0,
                    v.x + 0, v.y + 1, v.z + 0
                ]);
                normals.push.apply(normals, [
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0
                ]);
                var aoFactor = 1 - v.ao.top;
                colors.push.apply(colors, [
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                ]);
            }
            if (!([v.x, v.y - 1, v.z] in self.voxels)) {
                var ao0 = [v.x + 1, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao1 = [v.x + 0, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao2 = [v.x - 1, v.y - 1, v.z + 1] in self.voxels ? 1 : 0;
                var ao3 = [v.x - 1, v.y - 1, v.z + 0] in self.voxels ? 1 : 0;
                var ao4 = [v.x - 1, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao5 = [v.x + 0, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao6 = [v.x + 1, v.y - 1, v.z - 1] in self.voxels ? 1 : 0;
                var ao7 = [v.x + 1, v.y - 1, v.z + 0] in self.voxels ? 1 : 0;
                var aoIndex = 0;
                aoIndex += ao0 << 0;
                aoIndex += ao1 << 1;
                aoIndex += ao2 << 2;
                aoIndex += ao3 << 3;
                aoIndex += ao4 << 4;
                aoIndex += ao5 << 5;
                aoIndex += ao6 << 6;
                aoIndex += ao7 << 7;
                uvs.push.apply(uvs, self.genUVs(aoIndex));
                positions.push.apply(positions, [
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 1,
                    v.x + 0, v.y + 0, v.z + 0,
                    v.x + 1, v.y + 0, v.z + 0,
                ]);
                normals.push.apply(normals, [
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0
                ]);
                var aoFactor = 1 - v.ao.bottom;
                colors.push.apply(colors, [
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
                    v.r * aoFactor, v.g * aoFactor, v.b * aoFactor,
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

    function random() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }

    function random_choice(a) {
        return a[Math.floor(Math.random() * a.length)];
    }

    self.calculateAO = function(samples, range) {
        var rays = {
            top: [],
            bottom: [],
            left: [],
            right: [],
            front: [],
            back: []
        };
        for (var i = 0; i < samples * 100; i++) {
            var ray = {
                x: random(),
                y: random(),
                z: random()
            };
            var d = Math.sqrt(ray.x * ray.x + ray.y * ray.y + ray.z * ray.z);
            ray.x /= d;
            ray.y /= d;
            ray.z /= d;
            rays.top.push({
                x: ray.x,
                y: Math.abs(ray.y),
                z: ray.z,
            })
            rays.bottom.push({
                x: ray.x,
                y: -Math.abs(ray.y),
                z: ray.z,
            })
            rays.left.push({
                x: -Math.abs(ray.x),
                y: ray.y,
                z: ray.z,
            })
            rays.right.push({
                x: Math.abs(ray.x),
                y: ray.y,
                z: ray.z,
            })
            rays.front.push({
                x: ray.x,
                y: ray.y,
                z: -Math.abs(ray.z),
            })
            rays.back.push({
                x: ray.x,
                y: ray.y,
                z: Math.abs(ray.z),
            })
        }
        var keys = Object.keys(self.voxels);
        var faces = [
            "top", "bottom", "left", "right", "front", "back"
        ]
        var eyes = {
            top: [0.5, 1.01, 0.5],
            bottom: [0.5, -0.01, 0.5],
            left: [-0.01, 0.5, 0.5],
            right: [1.01, 0.5, 0.5],
            front: [0.5, 0.5, -0.01],
            back: [0.5, 0.5, 1.01]
        }
        for (var ki = 0; ki < keys.length; ki++) {
            var v = self.voxels[keys[ki]];
            for (var fi = 0; fi < faces.length; fi++) {
                var face = faces[fi];
                var nIntersections = 0;
                for (var i = 0; i < samples; i++) {
                    var ray = random_choice(rays[face]);
                    var e = eyes[face];
                    var eye = {
                        x: v.x + e[0],
                        y: v.y + e[1],
                        z: v.z + e[2]
                    };
                    var list = castRay(eye, ray, range);
                    for (var j = 0; j < list.length; j++) {
                        if (self.voxels[list[j]] != undefined) {
                            nIntersections++;
                            break;
                        }
                    }
                }
                v.ao[face] = nIntersections/samples;
            }
        }
    }


    self.initialize();

}