
var PointerLock = {};

PointerLock.onChange = function(callback) {
    document.addEventListener("pointerlockchange", callback, false);
    document.addEventListener("mozpointerlockchange", callback, false);
};

PointerLock.onError = function(callback) {
    document.addEventListener("pointerlockerror", callback, false);
    document.addEventListener("mozpointerlockerror", callback, false);
};

PointerLock.element = function() {
    return document.webkitPointerLockElement ||
           document.mozPointerLockElement ||
           document.pointerLockElement;
}

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
