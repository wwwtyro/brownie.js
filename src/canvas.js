
var Canvas = function(width, height) {

    var self = this;

    self.initialize = function() {
        self.width = width;
        self.height = height;
        self.data = new Uint8ClampedArray(self.width * self.height * 3);
    };

    self.index = function(x, y) {
        return y * self.width * 3 + x * 3;
    }

    self.setFloat = function(x, y, r, g, b) {
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);
        self.set(x, y, r, g, b);
    }

    self.set = function(x, y, r, g, b) {
        var q = self.index(x, y);
        self.data[q + 0] = r;
        self.data[q + 1] = g;
        self.data[q + 2] = b;
    };

    self.get = function(x, y) {
        var q = self.index(x, y);
        return {
            r: self.data[q + 0],
            g: self.data[q + 1],
            b: self.data[q + 2]
        };
    };

    self.blit = function(src, x, y) {
        for (var j = y; j < y + src.height; j++) {
            if (j >= self.height || j < 0) {
                continue;
            }
            for (var i = x; i < x + src.width; i++) {
                if (i >= self.width || i < 0) {
                    continue;
                }
                var c = src.get(i - x, j - y);
                self.set(i, j, c.r, c.g, c.b);
            }
        }
    }

    self.blitYFlipped = function (src, x, y) {
        for (var j = y; j < y + src.height; j++) {
            if (j >= self.height || j < 0) {
                continue;
            }
            for (var i = x; i < x + src.width; i++) {
                if (i >= self.width || i < 0) {
                    continue;
                }
                var c = src.get(i - x, (src.height - 1) - (j - y));
                self.set(i, j, c.r, c.g, c.b);
            }
        }
    }

    self.clone = function() {
        var copy = new Canvas(self.width, self.height);
        copy.data = new Uint8ClampedArray(self.data);
        return copy;
    }

    self.flipY = function() {
        var copy = self.clone();
        self.blitYFlipped(copy, 0, 0);
    }

    self.toRGBA = function() {
        var rgba = new Uint8ClampedArray(self.width * self.height * 4);
        for (var i = 0; i < self.width * self.height; i++) {
            rgba[i * 4 + 0] = self.data[i * 3 + 0];
            rgba[i * 4 + 1] = self.data[i * 3 + 1];
            rgba[i * 4 + 2] = self.data[i * 3 + 2];
            rgba[i * 4 + 3] = 255;
        }
        return rgba;
    }

    self.initialize();
}