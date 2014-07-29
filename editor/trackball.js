var Trackball = function(element, callback) {

    var self = this;

    self.initialize = function() {
        self.lastx = undefined;
        self.lasty = undefined;
        self.button = undefined;
        element.addEventListener("mousedown", self.onMouseDown, false);
        window.addEventListener("mouseup", self.onMouseUp, false);
        window.addEventListener("mousemove", self.onMouseMove, false);
    }

    self.onMouseDown = function(e) {
        if (self.button !== undefined) {
            return;
        }
        self.button = e.button;
        self.lastx = e.screenX;
        self.lasty = e.screenY;
    }

    self.onMouseUp = function(e) {
        if (e.button !== self.button) {
            return;
        }
        self.button = undefined;
    }

    self.onMouseMove = function(e) {
        if (self.button === undefined) {
            return;
        }
        var dx = e.screenX - self.lastx;
        var dy = e.screenY - self.lasty;
        self.lastx = e.screenX;
        self.lasty = e.screenY;
        if (callback !== undefined) {
            callback({dx: dx, dy: dy, button: self.button});
        }
    }

    self.initialize();
}