
var slope = 1;
var branchingRatio = 0.15;
var twistingRatio = 0.25;
var height = 128;
var leafRadius = 4;
var leafLife = 2;
var leafCount = 32;

clear();
setCamera(11.500, 65.500, 118.784, -1.571, -0.000);

function clamp(a) {
    return Math.min(1, Math.max(-1, a));
}

function randrange(a, b) {
    return a + Math.random() * (b - a);
}

function randbrown() {
    var c = Math.random() * 0.25 + 0.75;
    return {
        r: 0.647 * c,
        g: 0.165 * c,
        b: 0.165 * c
    };
}

function setCheck(x, y, z, r, g, b) {
    if (Math.round(y) < 0) {
        return;
    }
    if (get(Math.round(x), Math.round(y), Math.round(z)) !== undefined) {
        return;
    }
    set(Math.round(x), Math.round(y), Math.round(z), r, g, b);
}

function leaf(x, y, z) {
    var dx = Math.random() - 0.5;
    var dy = Math.random() - 0.5;
    var dz = Math.random() - 0.5;
    var l = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= l;
    dy /= l;
    dz /= l;
    var r = Math.random() * leafRadius;
    dx = Math.round(dx * r);
    dy = Math.round(dy * r);
    dz = Math.round(dz * r);
    var g = Math.random() * 0.9 + 0.1;
    setCheck(x + dx, y + dy, z + dz, 0, g, 0);
}

function sphere(x, y, z, r) {
    for (var i = x - r; i < x + r; i++) {
        for (var j = y - r; j < y + r; j++) {
            for (var k = z - r; k < z + r; k++) {
                if (Math.round(j) < 0) {
                    continue;
                }
                if (get(Math.round(i), Math.round(j), Math.round(k)) !== undefined) {
                    continue;
                }
                var dx = i - x;
                var dy = j - y;
                var dz = k - z;
                var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (d <= r) {
                    var br = randbrown();
                    setCheck(Math.round(i), Math.round(j), Math.round(k), br.r, br.g, br.b);
                }
            }
        }
    }
}

function newBranch(b) {
    if (b) {
        var dox = randrange(-slope, slope);
        var doy = randrange(slope/4, slope);
        var doz = randrange(-slope, slope);
        return {
            r: 0,
            x: b.x,
            y: b.y,
            z: b.z,
            dox: dox,
            doy: doy,
            doz: doz,
            dx: dox,
            dy: doy,
            dz: doz,
            life: b.life * 0.5,
            radius: b.radius * (b.life/height)
        };
    }
}

var branches = [{
        r: 1,
        x: 0,
        y: 0,
        z: 0,
        dox: 0,
        doy: 1,
        doz: 0,
        dx: 0,
        dy: 1,
        dz: 0,
        life: height,
        radius: 6
    }];

var doneGrowing = false;
while (!doneGrowing) {
    doneGrowing = true;
    var shoots = [];
    for (var i in branches) {
        var b = branches[i];
        if (b.life > 0) {
            doneGrowing = false;
            sphere(b.x, b.y, b.z, Math.max(1, b.radius * (b.life/height)));
            if (b.life <= leafLife) {
                for (var j = 0; j < leafCount; j++) {
                    leaf(b.x, b.y, b.z);
                }
            }
            b.x += clamp(b.dx);
            b.y += clamp(b.dy);
            b.z += clamp(b.dz);
            b.life--;
            if (Math.random() < branchingRatio) {
                shoots.push(newBranch(branches[i]));
            }
            if (Math.random() < twistingRatio) {
                b.dx = b.dox + randrange(-slope, slope) * 1;
                b.dy = b.doy + randrange(-slope, slope) * 0;
                b.dz = b.doz + randrange(-slope, slope) * 1;
            }
        }
    }
    branches.push.apply(branches, shoots);
}























