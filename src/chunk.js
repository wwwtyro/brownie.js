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

        var bounds = self.getBounds();
        var height = bounds.max.y - bounds.min.y + 1;
        var width = bounds.max.x - bounds.min.x + 1;
        var depth = bounds.max.z - bounds.min.z + 1;
        var ranges = [];
        var rects = [];

        self.markExternalFaces();

        function genQuads(face, topLeft, di, dj, dk, ni, nj, nk) {

            var used = {};

            function hasFace(p) {
                if ([p.x, p.y, p.z] in used) return false;
                var v = self.voxels[[p.x, p.y, p.z]];
                if (v == undefined) return false;
                if (v.faces[face].external) return true;
                return false;
            }

            for (var k = 0; k < nk; k++) {
                var kindex = topLeft.plus(dk.times(k));
                for (var j = 0; j < nj; j++) {
                    var jindex = kindex.plus(dj.times(j));
                    for (var i = 0; i < ni; i++) {
                        var iindex = jindex.plus(di.times(i));
                        if (hasFace(iindex)) {
                            var start = iindex.clone();
                            var icount = 1;
                            while (hasFace(start.plus(di.times(icount)))) {
                                icount++;
                            }
                            var jcount = 1;
                            var done = false;
                            while (!done) {
                                for (var l = 0; l < icount; l++) {
                                    if (!hasFace(start.plus(dj.times(jcount)).plus(di.times(l)))) {
                                        done = true;
                                        break;
                                    }
                                }
                                if (!done) {
                                    jcount++;    
                                }
                            }
                            ranges.push({
                                start: start,
                                di: di,
                                dj: dj,
                                ni: icount,
                                nj: jcount,
                                face: face
                            });
                            for (var ii = 0; ii < icount; ii++) {
                                for (var jj = 0; jj < jcount; jj++) {
                                    var u = start.plus(dj.times(jj)).plus(di.times(ii));
                                    used[[u.x, u.y, u.z]] = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        genQuads(
            "front", 
            new Vec3(bounds.max.x, bounds.max.y, bounds.min.z),
            new Vec3(-1, 0, 0),
            new Vec3(0, -1, 0),
            new Vec3(0, 0, 1),
            width,
            height,
            depth
        );

        genQuads(
            "back", 
            new Vec3(bounds.min.x, bounds.max.y, bounds.max.z),
            new Vec3(1, 0, 0),
            new Vec3(0, -1, 0),
            new Vec3(0, 0, -1),
            width,
            height,
            depth
        );

        genQuads(
            "left", 
            new Vec3(bounds.min.x, bounds.max.y, bounds.min.z),
            new Vec3(0, 0, 1),
            new Vec3(0, -1, 0),
            new Vec3(1, 0, 0),
            depth,
            height,
            width
        );

        genQuads(
            "right", 
            new Vec3(bounds.max.x, bounds.max.y, bounds.max.z),
            new Vec3(0, 0, -1),
            new Vec3(0, -1, 0),
            new Vec3(-1, 0, 0),
            depth,
            height,
            width
        );

        genQuads(
            "top", 
            new Vec3(bounds.min.x, bounds.max.y, bounds.min.z),
            new Vec3(1, 0, 0),
            new Vec3(0, 0, 1),
            new Vec3(0, -1, 0),
            width,
            depth,
            height
        );

        genQuads(
            "bottom", 
            new Vec3(bounds.max.x, bounds.min.y, bounds.min.z),
            new Vec3(-1, 0, 0),
            new Vec3(0, 0, 1),
            new Vec3(0, 1, 0),
            width,
            depth,
            height
        );

        var normals = {
            front: [0, 0, -1],
            back: [0, 0, 1],
            left: [-1, 0, 0],
            right: [1, 0, 0],
            top: [0, 1, 0],
            bottom: [0, -1, 0]
        };

        var faceOffsets = {
            front: new Vec3(1, 1, 0),
            back: new Vec3(0, 1, 1),
            left: new Vec3(0, 1, 0),
            right: new Vec3(1, 1, 1),
            top: new Vec3(0, 1, 0),
            bottom: new Vec3(1, 0, 0)
        };

        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            var canvas = document.createElement("canvas");
            canvas.width = range.ni;
            canvas.height = range.nj;
            var ctx = canvas.getContext("2d");
            for (var jj = 0; jj < range.nj; jj++) {
                var jindex = range.start.plus(range.dj.times(jj));
                for (var ii = 0; ii < range.ni; ii++) {
                    var iindex = jindex.plus(range.di.times(ii));
                    var v = self.voxels[[iindex.x, iindex.y, iindex.z]];
                    var aoFactor = 1 - v.faces[range.face].ao;
                    var r = Math.round(v.r * aoFactor * 255);
                    var g = Math.round(v.g * aoFactor * 255);
                    var b = Math.round(v.b * aoFactor * 255);
                    ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                    ctx.fillRect(ii, jj, 1, 1);
                }
            }

            var p0 = range.start.plus(range.dj.times(range.nj)).plus(faceOffsets[range.face]);
            var p1 = range.start.plus(range.di.times(range.ni)).plus(range.dj.times(range.nj)).plus(faceOffsets[range.face]);
            var p2 = range.start.plus(range.di.times(range.ni)).plus(faceOffsets[range.face]);
            var p3 = range.start.clone().plus(faceOffsets[range.face]);

            var rect = {
                canvas: canvas,
                positions: [
                    [p0.x, p0.y, p0.z],
                    [p1.x, p1.y, p1.z],
                    [p2.x, p2.y, p2.z],
                    [p3.x, p3.y, p3.z]
                ],
                normal: normals[range.face],
                face: range.face
            }

            rects.push(rect);

        }

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
            var top = 1 - r.uvs[0] / canvas.height;
            var left = r.uvs[1] / canvas.width;
            var bottom = 1 - r.uvs[2] / canvas.height;
            var right = r.uvs[3] / canvas.width;
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
                self.children.left = new Node(self.left, self.top, self.right, self.top + height - 1);
                self.children.right = new Node(self.left, self.top + height, self.right, self.bottom);
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
    ctx.fillStyle = "rgb(255,0,255)";
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