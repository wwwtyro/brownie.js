
var height = 48;
var radius = 8;

clear();

function column() {
    for (var y = 0; y < height; y++) {
        for (var x = -radius; x <= radius; x++) {
            for (var z = -radius; z <= radius; z++) {
                var d = Math.sqrt(x*x + z*z);
                if (d < radius * 0.8 || y < 4 || y > height - 5) {
                    var c = Math.random() * 0.4 + 0.6;
                    set(x, y, z, c, c, c);
                }
            }
        }
    }
}

function blast() {
    var cut = Math.floor(Math.random() * (0.5*height) + (0.25 * height));
    var ic = cut;
    var cd = Math.random() * 2 - 1;
    var cdd = Math.random() * 0.5 - 0.25;
    for (var x = -radius; x <= radius; x++) {
        cut += cd;
        cd += cdd;
        for (var z = -radius; z <= radius; z++) {
            for (var y = cut; y < height; y++) {
                var v = get(x, y, z);
                if (v) {
                    unset(v.x, v.y, v.z);
                    set((v.y - ic) + radius + 16, v.x + radius * 0.8, v.z, v.r, v.g, v.b)
                }
            }
        }
    }
}

function litter() {
    
}

column();
blast();