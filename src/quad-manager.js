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
