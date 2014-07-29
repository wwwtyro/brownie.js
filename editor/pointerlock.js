
var PointerLock = {};

PointerLock.onChange = function(callback) {
    document.addEventListener("pointerlockchange", callback, false);
    document.addEventListener("mozpointerlockchange", callback, false);
    document.addEventListener("webkitpointerlockchange", callback, false);
};

PointerLock.onError = function(callback) {
    document.addEventListener("pointerlockerror", callback, false);
    document.addEventListener("mozpointerlockerror", callback, false);
    document.addEventListener("webkitpointerlockerror", callback, false);
};

PointerLock.requestFor = function(element) {
    element.requestPointerLock = element.requestPointerLock ||
        element.mozRequestPointerLock ||
        element.webkitRequestPointerLock;
    element.requestPointerLock();
};

PointerLock.exit = function() {
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
    document.exitPointerLock();
};
