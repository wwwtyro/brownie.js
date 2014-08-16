var l = 32;
var n = 512;
var f = 32;

setCamera(45.111, 76.349, -61.431, -4.127, -0.587);

var x = [], y = [], z = [];

for (var i = 0; i < n; i++) {
    x.push(Math.random() * 2 - 1);
    y.push(Math.random() * 2 - 1);
    z.push(Math.random() * 2 - 1);
}

for (var i = 0; i < f; i++) {
    for (var j = 0; j < n; j++) {
        var px = l * x[j] * Math.sin(Math.PI*(i/f));
        var py = l * y[j] * Math.sin(Math.PI*(i/f));
        var pz = l * z[j] * Math.sin(Math.PI*(i/f));
        set(px, py + l, pz, 1, 1, 1);
    }
    if (i < f - 1) {
        addFrame();
        setFrame(i + 1);
    }
}

play()