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
            faces: {
                top: {
                    ao: 0,
                    external: false
                },
                bottom: {
                    ao: 0,
                    external: false
                },
                left: {
                    ao: 0,
                    external: false
                },
                right: {
                    ao: 0,
                    external: false
                },
                front: {
                    ao: 0,
                    external: false
                },
                back: {
                    ao: 0,
                    external: false
                }
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
            bounds.max.x = Math.max(bounds.max.x, v.x);
            bounds.max.y = Math.max(bounds.max.y, v.y);
            bounds.max.z = Math.max(bounds.max.z, v.z);
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
                var aoFactor = 1 - v.faces.back.ao;
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
                var aoFactor = 1 - v.faces.front.ao;
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
                var aoFactor = 1 - v.faces.left.ao;
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
                var aoFactor = 1 - v.faces.right.ao;
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
                var aoFactor = 1 - v.faces.top.ao;
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
                var aoFactor = 1 - v.faces.bottom.ao;
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

    self.markExternalFaces = function() {
        var toVisit = {};
        var visited = {};
        var visiting = {};

        var bounds = self.getBounds();

        // Mark all faces as internal.
        var keys = Object.keys(self.voxels);
        for (var ki = 0; ki < keys.length; ki++) {
            var v = self.voxels[keys[ki]];
            v.faces.top.external = false;
            v.faces.bottom.external = false;
            v.faces.left.external = false;
            v.faces.right.external = false;
            v.faces.front.external = false;
            v.faces.back.external = false;
        }

        // Create an initial set of voxels to visit, surrounding the bounds.
        for (var x = bounds.min.x - 1; x <= bounds.max.x + 1; x++) {
            for (var y = bounds.min.y - 1; y <= bounds.max.y + 1; y++) {
                for (var z = bounds.min.z - 1; z <= bounds.max.z + 1; z++) {
                    if (x == bounds.min.x - 1 || x == bounds.max.x + 1) {
                        toVisit[[x, y, z]] = {
                            x: x,
                            y: y,
                            z: z
                        };
                    }
                    if (y == bounds.min.y - 1 || y == bounds.max.y + 1) {
                        toVisit[[x, y, z]] = {
                            x: x,
                            y: y,
                            z: z
                        };
                    }
                    if (z == bounds.min.z - 1 || z == bounds.max.z + 1) {
                        toVisit[[x, y, z]] = {
                            x: x,
                            y: y,
                            z: z
                        };
                    }
                }
            }
        }

        function markFace(v, x, y, z, face) {
            self.voxels[[v.x + x, v.y + y, v.z + z]].faces[face].external = true;
        }

        function schedule(v, x, y, z) {
            // Adds a target voxel to the toVisit list if it passes some criteria.

            // The voxel we want to schedule.
            var target = [v.x + x, v.y + y, v.z + z];

            // Can't be one we've already looked at.
            if (target in visited) {
                return;
            }

            // Can't be one we're currently looking at.
            if (target in visiting) {
                return;
            }

            // Needs to be within the bounds of the chunk.
            if (target[0] < bounds.min.x - 1 || target[0] > bounds.max.x + 1) {
                return;
            }
            if (target[1] < bounds.min.y - 1 || target[1] > bounds.max.y + 1) {
                return;
            }
            if (target[2] < bounds.min.z - 1 || target[2] > bounds.max.z + 1) {
                return;
            }

            // Everything is okay; schedule target for a visit.
            toVisit[target] = {
                x: v.x + x,
                y: v.y + y,
                z: v.z + z
            }
        }

        while (Object.keys(toVisit).length > 0) {
            visiting = toVisit;
            toVisit = {};
            for (var key in visiting) {
                visited[key] = true;

                var v = visiting[key];

                if ([v.x, v.y + 1, v.z] in self.voxels) {
                    markFace(v, 0, 1, 0, "bottom");
                } else {
                    schedule(v, 0, 1, 0);
                }

                if ([v.x, v.y - 1, v.z] in self.voxels) {
                    markFace(v, 0, -1, 0, "top");
                } else {
                    schedule(v, 0, -1, 0);
                }

                if ([v.x - 1, v.y, v.z] in self.voxels) {
                    markFace(v, -1, 0, 0, "right");
                } else {
                    schedule(v, -1, 0, 0);
                }

                if ([v.x + 1, v.y, v.z] in self.voxels) {
                    markFace(v, 1, 0, 0, "left");
                } else {
                    schedule(v, 1, 0, 0);
                }

                if ([v.x, v.y, v.z - 1] in self.voxels) {
                    markFace(v, 0, 0, -1, "back");
                } else {
                    schedule(v, 0, 0, -1);
                }

                if ([v.x, v.y, v.z + 1] in self.voxels) {
                    markFace(v, 0, 0, 1, "front");
                } else {
                    schedule(v, 0, 0, 1);
                }

            }
        }
    }



    self.calculateAO = function(samples, range, depth, progress) {

        samples = samples === undefined ? 100 : samples;
        range = range === undefined ? 32 : range;
        depth = depth === undefined ? 1 : depth;

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
                x: random.gauss(),
                y: random.gauss(),
                z: random.gauss()
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

        self.markExternalFaces();

        var faces = [
            "top", "bottom", "left", "right", "front", "back"
        ];

        var eyes = {
            top: [0.5, 1.01, 0.5],
            bottom: [0.5, -0.01, 0.5],
            left: [-0.01, 0.5, 0.5],
            right: [1.01, 0.5, 0.5],
            front: [0.5, 0.5, -0.01],
            back: [0.5, 0.5, 1.01]
        };

        var keys = Object.keys(self.voxels);

        for (var ki = 0; ki < keys.length; ki++) {
            if (progress) {
                progress(ki / keys.length);
            }
            var v = self.voxels[keys[ki]];
            for (var fi = 0; fi < faces.length; fi++) {
                var face = faces[fi];
                if (!v.faces[face].external) {
                    continue;
                }
                var nIntersections = 0;
                for (var i = 0; i < samples; i++) {
                    var ray = random.choice(rays[face]);
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
                v.faces[face].ao = depth * nIntersections / samples;
            }
        }
    }



    self.antialiasAO = function() {

        var offsets = {
            top: [
                [-1, 0, 1],
                [0, 0, 1],
                [1, 0, 1],
                [1, 0, 0],
                [1, 0, -1],
                [0, 0, -1],
                [-1, 0, -1],
                [-1, 0, 0]
            ],
            bottom: [
                [-1, 0, 1],
                [0, 0, 1],
                [1, 0, 1],
                [1, 0, 0],
                [1, 0, -1],
                [0, 0, -1],
                [-1, 0, -1],
                [-1, 0, 0]
            ],
            left: [
                [0, -1, -1],
                [0, -1, 0],
                [0, -1, 1],
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, -1],
                [0, 0, -1]
            ],
            right: [
                [0, -1, -1],
                [0, -1, 0],
                [0, -1, 1],
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, -1],
                [0, 0, -1]
            ],
            front: [
                [-1, -1, 0],
                [0, -1, 0],
                [1, -1, 0],
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
                [-1, 1, 0],
                [-1, 0, 0],
            ],
            back: [
                [-1, -1, 0],
                [0, -1, 0],
                [1, -1, 0],
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
                [-1, 1, 0],
                [-1, 0, 0],
            ],
        };

        var offsetKeys = Object.keys(offsets);

        var keys = Object.keys(self.voxels);

        var result = [];

        for (var ki = 0; ki < keys.length; ki++) {
            var v = self.voxels[keys[ki]];
            for (var ko = 0; ko < offsetKeys.length; ko++) {
                var face = offsetKeys[ko];
                if (!v.faces[face].external) {
                    continue;
                }
                var count = 1;
                var total = v.faces[face].ao;
                for (var fi = 0; fi < 8; fi++) {
                    var o = offsets[face][fi];
                    var vp = self.voxels[[v.x + o[0], v.y + o[1], v.z + o[2]]];
                    if (!vp || !vp.faces[face].external) {
                        continue;
                    }
                    count++;
                    total += vp.faces[face].ao;
                }
                result.push([v, face, total / count]);
            }
        }

        for (var i = 0; i < result.length; i++) {
            var r = result[i];
            r[0].faces[r[1]].ao = r[2];
        }
    }


    self.freeze = function() {

        var used;

        function hasFace(x, y, z, face) {
            if ([x, y, z] in used) {
                return false;
            }
            var v = self.voxels[[x, y, z]];
            if (v == undefined) {
                return false;
            }
            if (v.faces[face].external) {
                return true;
            }
            return false;
        }

        self.markExternalFaces();

        var bounds = self.getBounds();
        var ranges = [];

        // front faces
        used = {};
        for (var zi = bounds.min.z; zi <= bounds.max.z; zi++) {
            var xi = bounds.min.x;
            var yi = bounds.min.y;
            while (true) {
                if (hasFace(xi, yi, zi, "front")) {
                    var xstart = xi;
                    var xend = xi;
                    while (hasFace(xend + 1, yi, zi, "front")) {
                        xend++;
                    }
                    var ystart = yi;
                    var yend = yi;
                    var done = false;
                    while (!done) {
                        for (var x = xstart; x <= xend; x++) {
                            if (!hasFace(x, yend + 1, zi, "front")) {
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            yend++;
                        }
                    }
                    for (var x = xstart; x <= xend; x++) {
                        for (var y = ystart; y <= yend; y++) {
                            used[[x, y, zi]] = true;
                        }
                    }
                    ranges.push([xstart, xend, ystart, yend, zi, "front"]);
                }
                xi++;
                if (xi > bounds.max.x) {
                    xi = 0;
                    yi++;
                    if (yi > bounds.max.y) {
                        break;
                    }
                }
            }
        }

        // back faces
        used = {};
        for (var zi = bounds.min.z; zi <= bounds.max.z; zi++) {
            var xi = bounds.min.x;
            var yi = bounds.min.y;
            while (true) {
                if (hasFace(xi, yi, zi, "back")) {
                    var xstart = xi;
                    var xend = xi;
                    while (hasFace(xend + 1, yi, zi, "back")) {
                        xend++;
                    }
                    var ystart = yi;
                    var yend = yi;
                    var done = false;
                    while (!done) {
                        for (var x = xstart; x <= xend; x++) {
                            if (!hasFace(x, yend + 1, zi, "back")) {
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            yend++;
                        }
                    }
                    for (var x = xstart; x <= xend; x++) {
                        for (var y = ystart; y <= yend; y++) {
                            used[[x, y, zi]] = true;
                        }
                    }
                    ranges.push([xstart, xend, ystart, yend, zi, "back"]);
                }
                xi++;
                if (xi > bounds.max.x) {
                    xi = 0;
                    yi++;
                    if (yi > bounds.max.y) {
                        break;
                    }
                }
            }
        }

        // left faces
        used = {};
        for (var xi = bounds.min.x; xi <= bounds.max.x; xi++) {
            var zi = bounds.min.z;
            var yi = bounds.min.y;
            while (true) {
                if (hasFace(xi, yi, zi, "left")) {
                    var zstart = zi;
                    var zend = zi;
                    while (hasFace(xi, yi, zend+1, "left")) {
                        zend++;
                    }
                    var ystart = yi;
                    var yend = yi;
                    var done = false;
                    while (!done) {
                        for (var z = zstart; z <= zend; z++) {
                            if (!hasFace(xi, yend + 1, z, "left")) {
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            yend++;
                        }
                    }
                    for (var z = zstart; z <= zend; z++) {
                        for (var y = ystart; y <= yend; y++) {
                            used[[xi, y, z]] = true;
                        }
                    }
                    ranges.push([zstart, zend, ystart, yend, xi, "left"]);
                }
                zi++;
                if (zi > bounds.max.z) {
                    zi = 0;
                    yi++;
                    if (yi > bounds.max.y) {
                        break;
                    }
                }
            }
        }

        // right faces
        used = {};
        for (var xi = bounds.min.x; xi <= bounds.max.x; xi++) {
            var zi = bounds.min.z;
            var yi = bounds.min.y;
            while (true) {
                if (hasFace(xi, yi, zi, "right")) {
                    var zstart = zi;
                    var zend = zi;
                    while (hasFace(xi, yi, zend+1, "right")) {
                        zend++;
                    }
                    var ystart = yi;
                    var yend = yi;
                    var done = false;
                    while (!done) {
                        for (var z = zstart; z <= zend; z++) {
                            if (!hasFace(xi, yend + 1, z, "right")) {
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            yend++;
                        }
                    }
                    for (var z = zstart; z <= zend; z++) {
                        for (var y = ystart; y <= yend; y++) {
                            used[[xi, y, z]] = true;
                        }
                    }
                    ranges.push([zstart, zend, ystart, yend, xi, "right"]);
                }
                zi++;
                if (zi > bounds.max.z) {
                    zi = 0;
                    yi++;
                    if (yi > bounds.max.y) {
                        break;
                    }
                }
            }
        }

        // bottom faces
        used = {};
        for (var yi = bounds.min.y; yi <= bounds.max.y; yi++) {
            var xi = bounds.min.x;
            var zi = bounds.min.z;
            while (true) {
                if (hasFace(xi, yi, zi, "bottom")) {
                    var xstart = xi;
                    var xend = xi;
                    while (hasFace(xend + 1, yi, zi, "bottom")) {
                        xend++;
                    }
                    var zstart = zi;
                    var zend = zi;
                    var done = false;
                    while (!done) {
                        for (var x = xstart; x <= xend; x++) {
                            if (!hasFace(x, yi, zend + 1, "bottom")) {
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            zend++;
                        }
                    }
                    for (var x = xstart; x <= xend; x++) {
                        for (var z = zstart; z <= zend; z++) {
                            used[[x, yi, z]] = true;
                        }
                    }
                    ranges.push([xstart, xend, zstart, zend, yi, "bottom"]);
                }
                xi++;
                if (xi > bounds.max.x) {
                    xi = 0;
                    zi++;
                    if (zi > bounds.max.z) {
                        break;
                    }
                }
            }
        }

        // top faces
        used = {};
        for (var yi = bounds.min.y; yi <= bounds.max.y; yi++) {
            var xi = bounds.min.x;
            var zi = bounds.min.z;
            while (true) {
                if (hasFace(xi, yi, zi, "top")) {
                    var xstart = xi;
                    var xend = xi;
                    while (hasFace(xend + 1, yi, zi, "top")) {
                        xend++;
                    }
                    var zstart = zi;
                    var zend = zi;
                    var done = false;
                    while (!done) {
                        for (var x = xstart; x <= xend; x++) {
                            if (!hasFace(x, yi, zend + 1, "top")) {
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            zend++;
                        }
                    }
                    for (var x = xstart; x <= xend; x++) {
                        for (var z = zstart; z <= zend; z++) {
                            used[[x, yi, z]] = true;
                        }
                    }
                    ranges.push([xstart, xend, zstart, zend, yi, "top"]);
                }
                xi++;
                if (xi > bounds.max.x) {
                    xi = 0;
                    zi++;
                    if (zi > bounds.max.z) {
                        break;
                    }
                }
            }
        }


        var rects = [];

        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];

            // front
            if (range[5] == "front") {
                var xmin = range[0];
                var xmax = range[1];
                var ymin = range[2];
                var ymax = range[3];
                var z = range[4];
                var canvas = document.createElement("canvas");
                canvas.width = xmax - xmin + 1;
                canvas.height = ymax - ymin + 1;
                var ctx = canvas.getContext("2d");
                for (var x = xmin; x <= xmax; x++) {
                    for (var y = ymin; y <= ymax; y++) {
                        var v = self.voxels[[x, y, z]];
                        var cx = x - xmin;
                        var cy = y - ymin;
                        var aoFactor = 1 - v.faces.front.ao;
                        var r = Math.round(v.r * aoFactor * 255);
                        var g = Math.round(v.g * aoFactor * 255);
                        var b = Math.round(v.b * aoFactor * 255);
                        ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        ctx.fillRect(cx, cy, 1, 1);
                    }
                }
                var rect = {
                    canvas: canvas,
                    positions: [
                        [xmax + 1, ymin, z],
                        [xmin, ymin, z],
                        [xmin, ymax + 1, z],
                        [xmax + 1, ymax + 1, z]
                    ],
                    normal: [0, 0, -1],
                    uvs: null,
                    face: range[5]
                }
                rects.push(rect);
            }

            // back
            if (range[5] == "back") {
                var xmin = range[0];
                var xmax = range[1];
                var ymin = range[2];
                var ymax = range[3];
                var z = range[4];
                var canvas = document.createElement("canvas");
                canvas.width = xmax - xmin + 1;
                canvas.height = ymax - ymin + 1;
                var ctx = canvas.getContext("2d");
                for (var x = xmin; x <= xmax; x++) {
                    for (var y = ymin; y <= ymax; y++) {
                        var v = self.voxels[[x, y, z]];
                        var cx = x - xmin;
                        var cy = y - ymin;
                        var aoFactor = 1 - v.faces.back.ao;
                        var r = Math.round(v.r * aoFactor * 255);
                        var g = Math.round(v.g * aoFactor * 255);
                        var b = Math.round(v.b * aoFactor * 255);
                        ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        ctx.fillRect(cx, cy, 1, 1);
                    }
                }
                var rect = {
                    canvas: canvas,
                    positions: [
                        [xmin, ymin, z + 1],
                        [xmax + 1, ymin, z + 1],
                        [xmax + 1, ymax + 1, z + 1],
                        [xmin, ymax + 1, z + 1]
                    ],
                    normal: [0, 0, 1],
                    uvs: null,
                    face: range[5]
                }
                rects.push(rect);
            }

            // left
            if (range[5] == "left") {
                var zmin = range[0];
                var zmax = range[1];
                var ymin = range[2];
                var ymax = range[3];
                var x = range[4];
                var canvas = document.createElement("canvas");
                canvas.width = zmax - zmin + 1;
                canvas.height = ymax - ymin + 1;
                var ctx = canvas.getContext("2d");
                for (var z = zmin; z <= zmax; z++) {
                    for (var y = ymin; y <= ymax; y++) {
                        var v = self.voxels[[x, y, z]];
                        var cx = z - zmin;
                        var cy = y - ymin;
                        var aoFactor = 1 - v.faces.left.ao;
                        var r = Math.round(v.r * aoFactor * 255);
                        var g = Math.round(v.g * aoFactor * 255);
                        var b = Math.round(v.b * aoFactor * 255);
                        ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        ctx.fillRect(cx, cy, 1, 1);
                    }
                }
                var rect = {
                    canvas: canvas,
                    positions: [
                        [x, ymin, zmin],
                        [x, ymin, zmax + 1],
                        [x, ymax + 1, zmax + 1],
                        [x, ymax + 1, zmin]
                    ],
                    normal: [-1, 0, 0],
                    uvs: null,
                    face: range[5]
                }
                rects.push(rect);
            }

            // right
            if (range[5] == "right") {
                var zmin = range[0];
                var zmax = range[1];
                var ymin = range[2];
                var ymax = range[3];
                var x = range[4];
                var canvas = document.createElement("canvas");
                canvas.width = zmax - zmin + 1;
                canvas.height = ymax - ymin + 1;
                var ctx = canvas.getContext("2d");
                for (var z = zmin; z <= zmax; z++) {
                    for (var y = ymin; y <= ymax; y++) {
                        var v = self.voxels[[x, y, z]];
                        var cx = z - zmin;
                        var cy = y - ymin;
                        var aoFactor = 1 - v.faces.right.ao;
                        var r = Math.round(v.r * aoFactor * 255);
                        var g = Math.round(v.g * aoFactor * 255);
                        var b = Math.round(v.b * aoFactor * 255);
                        ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        ctx.fillRect(cx, cy, 1, 1);
                    }
                }
                var rect = {
                    canvas: canvas,
                    positions: [
                        [x + 1, ymin, zmax + 1],
                        [x + 1, ymin, zmin],
                        [x + 1, ymax + 1, zmin],
                        [x + 1, ymax + 1, zmax + 1]
                    ],
                    normal: [1, 0, 0],
                    uvs: null,
                    face: range[5]
                }
                rects.push(rect);
            }

            // bottom
            if (range[5] == "bottom") {
                var xmin = range[0];
                var xmax = range[1];
                var zmin = range[2];
                var zmax = range[3];
                var y = range[4];
                var canvas = document.createElement("canvas");
                canvas.width = xmax - xmin + 1;
                canvas.height = zmax - zmin + 1;
                var ctx = canvas.getContext("2d");
                for (var x = xmin; x <= xmax; x++) {
                    for (var z = zmin; z <= zmax; z++) {
                        var v = self.voxels[[x, y, z]];
                        var cx = x - xmin;
                        var cy = z - zmin;
                        var aoFactor = 1 - v.faces.bottom.ao;
                        var r = Math.round(v.r * aoFactor * 255);
                        var g = Math.round(v.g * aoFactor * 255);
                        var b = Math.round(v.b * aoFactor * 255);
                        ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        ctx.fillRect(cx, cy, 1, 1);
                    }
                }
                var rect = {
                    canvas: canvas,
                    positions: [
                        [xmin, y, zmin],
                        [xmax + 1, y, zmin],
                        [xmax + 1, y, zmax + 1],
                        [xmin, y, zmax + 1]
                    ],
                    normal: [0, -1, 0],
                    uvs: null,
                    face: range[5]
                }
                rects.push(rect);
            }

            // top
            if (range[5] == "top") {
                var xmin = range[0];
                var xmax = range[1];
                var zmin = range[2];
                var zmax = range[3];
                var y = range[4];
                var canvas = document.createElement("canvas");
                canvas.width = xmax - xmin + 1;
                canvas.height = zmax - zmin + 1;
                var ctx = canvas.getContext("2d");
                for (var x = xmin; x <= xmax; x++) {
                    for (var z = zmin; z <= zmax; z++) {
                        var v = self.voxels[[x, y, z]];
                        var cx = x - xmin;
                        var cy = z - zmin;
                        var aoFactor = 1 - v.faces.top.ao;
                        var r = Math.round(v.r * aoFactor * 255);
                        var g = Math.round(v.g * aoFactor * 255);
                        var b = Math.round(v.b * aoFactor * 255);
                        ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        ctx.fillRect(cx, cy, 1, 1);
                    }
                }
                var rect = {
                    canvas: canvas,
                    positions: [
                        [xmin, y + 1, zmax + 1],
                        [xmax + 1, y + 1, zmax + 1],
                        [xmax + 1, y + 1, zmin],
                        [xmin, y + 1, zmin]
                    ],
                    normal: [0, 1, 0],
                    uvs: null,
                    face: range[5]
                }
                rects.push(rect);
            }


        }

        console.log(rects.length);

        var size = 1;
        var canvas = false;
        while (!canvas) {
            canvas = buildAtlas(rects, size, size);
            size *= 2;
        }

        var texture = new THREE.Texture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        var m = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: texture,
        });

        var g = new THREE.BufferGeometry();
        var positions = [];
        var normals = [];
        var uvs = [];
        for (var i = 0; i < rects.length; i++) {
            var r = rects[i];
            // if (r.face != "back") {
            //     continue;
            // }
            positions.push.apply(positions, r.positions[0]);
            positions.push.apply(positions, r.positions[1]);
            positions.push.apply(positions, r.positions[2]);
            positions.push.apply(positions, r.positions[0]);
            positions.push.apply(positions, r.positions[2]);
            positions.push.apply(positions, r.positions[3]);
            normals.push.apply(normals, r.normal);
            normals.push.apply(normals, r.normal);
            normals.push.apply(normals, r.normal);
            normals.push.apply(normals, r.normal);
            normals.push.apply(normals, r.normal);
            normals.push.apply(normals, r.normal);
            var top = 1 - r.uvs[0]/canvas.height;
            var left = r.uvs[1]/canvas.width;
            var bottom = 1 - r.uvs[2]/ canvas.height;
            var right = r.uvs[3]/canvas.width;
            if (r.face == "back") {
                top = bottom + (bottom = top, 0);
            }
            if (r.face == "front") {
                top = bottom + (bottom = top, 0);
                left = right + (right = left, 0);
            }
            if (r.face == "left") {
                top = bottom + (bottom = top, 0);
            }
            if (r.face == "right") {
                top = bottom + (bottom = top, 0);
                left = right + (right = left, 0);
            }
            if (r.face == "bottom") {
                top = bottom + (bottom = top, 0);
            }
            uvs.push.apply(uvs, [left, bottom]);
            uvs.push.apply(uvs, [right, bottom]);
            uvs.push.apply(uvs, [right, top]);
            uvs.push.apply(uvs, [left, bottom]);
            uvs.push.apply(uvs, [right, top]);
            uvs.push.apply(uvs, [left, top]);
        }

        g.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        g.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        g.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);

        // self.geometry.addAttribute('position', new THREE.BufferAttribute(a3, 3));
        // self.geometry.addAttribute('normal', new THREE.BufferAttribute(a3, 3));
        // self.geometry.addAttribute('color', new THREE.BufferAttribute(a3, 3));
        // self.geometry.addAttribute('uv', new THREE.BufferAttribute(a2, 2));
        // self.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);

        document.body.appendChild(canvas);
        canvas.style.border = "1px solid red";

        return new THREE.Mesh(g, m);
    }


    self.initialize();

}


var Node = function(left, top, right, bottom) {
    var self = this;

    self.initialize = function() {
        self.top = top;
        self.left = left;
        self.bottom = bottom;
        self.right = right;
        self.width = right - left + 1;
        self.height = bottom - top + 1;
        self.rect = null;
        self.children = {
            left: null,
            right: null
        };
    }

    self.insert = function(rect) {

        if (self.children.left || self.children.right) {

            if (self.children.left.insert(rect)) {
                return true;
            } else {
                return self.children.right.insert(rect);
            }

        } else {

            if (self.rect != null) {
                return false;
            }

            var width = rect.canvas.width;
            var height = rect.canvas.height;

            if (self.width < width || self.height < height) {
                return false;
            }

            if (self.width == width && self.height == height) {
                self.rect = rect;
                rect.uvs = [self.top, self.left, self.bottom + 1, self.right + 1];
                return true;
            }

            var dw = self.width - width;
            var dh = self.height - height;

            if (dw > dh) {
                self.children.left = new Node(self.left, self.top, self.left + width - 1, self.bottom);
                self.children.right = new Node(self.left + width, self.top, self.right, self.bottom);
            } else {
                self.children.left = new Node(self.left, self.top, self.right, self.top+height-1);
                self.children.right = new Node(self.left, self.top+height, self.right, self.bottom);
            }

            return self.children.left.insert(rect);
        }
    }

    self.initialize();
}

function buildAtlas(rects, width, height) {

    var root = new Node(0, 0, width - 1, height - 1);

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;


    var ctx = canvas.getContext("2d");
    ctx.fillStyle="rgb(255,0,255)";
    ctx.fillRect(0, 0, width, height);

    for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        var inserted = root.insert(rect);
        if (!inserted) {
            return false;
        }
        ctx.drawImage(rect.canvas, rect.uvs[1], rect.uvs[0]);
    }

    return canvas;
}