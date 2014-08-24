function floorAsset() {
    var size = 16;
    var b = new Brownie(renderer);
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var c = Math.random() * 0.25 + 0.75;
            b.set(i, 0, j, c * 0.75, c * 0.5, c * 0.25);
        }
    }
    b.rebuild();
    return {
        frames: {
            default: b
        },
        states: {
            default: {
                frames: ["default"],
                speed: 1
            }
        }
    };
}


function wallAsset() {
    var size = 16;
    var b = new Brownie(renderer);
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            for (var z = 0; z < size; z++) {
                var c = Math.random() * 0.25 + 0.75;
                var off = 1 - y / size;
                b.set(x, y, z, c * (0.5 + off * 0.25), c * 0.5, c * (0.5 - off * 0.25));
            }
        }
    }
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            for (var z = 0; z < size; z++) {
                if (y % 5 < 3 && (x === 0 || x === size - 1 || z === 0 || z === size - 1)) {
                    b.unset(x, y, z);
                }
            }
        }
    }
    b.rebuild();
    return {
        frames: {
            default: b
        },
        states: {
            default: {
                frames: ["default"],
                speed: 1
            }
        }
    };
}

function stalagmiteAsset() {
    var br = new Brownie(renderer);
    var height = 64;
    function layer(x, y, z, radius, r, g, b) {
        for (var i = Math.round(x - radius); i <= x + radius; i++) {
            for (var j = Math.round(z - radius); j <= z + radius; j++) {
                var dx = i - x;
                var dz = j - z;
                var d = Math.sqrt(dx*dx + dz*dz);
                if (d <= radius) {
                    if (y === 0 || br.get(i, y - 1, j)) {
                        br.set(i, y, j, r, g, b);
                    }
                }
            }
        }
    }
    var radius = height/8;
    var y = 0;
    while (radius > height/32) {
        radius *= Math.random() * 0.05 + 0.95;
        var x = 1 * (Math.random() - 0.5);
        var z = 1 * (Math.random() - 0.5);
        layer(x, y, z, radius, 0.75, 0.5, 0.25);
        y++;
    }
    br.rebuild();
    return {
        frames: {
            default: br
        },
        states: {
            default: {
                frames: ["default"],
                speed: 1
            }
        }
    };
}


function humanAsset() {
    var r = 0.75,
        g = 0.75,
        b = 0.75;
    var frames = {};
    // Standing still.
    var br = new Brownie(renderer);
    br.set(0, 0, 0, r, g, b); // left foot
    br.set(2, 0, 0, r, g, b); // right foot
    br.set(1, 2, 0, r, g, b); // torso
    br.set(1, 3, 0, r, g, b);
    br.set(-1, 3, 0, r, g, b); // left hand
    br.set(3, 3, 0, r, g, b); // right hand
    br.set(1, 5, 0, r, g, b); // head
    br.rebuild();
    frames.standing = br;
    frames.default = br;
    // Step left.
    var br = new Brownie(renderer);
    br.set(0, 0, -1, r, g, b); // left foot
    br.set(2, 0, 1, r, g, b); // right foot
    br.set(1, 2, 0, r, g, b); // torso
    br.set(1, 3, 0, r, g, b);
    br.set(-1, 3, 1, r, g, b); // left hand
    br.set(3, 3, -1, r, g, b); // right hand
    br.set(1, 5, 0, r, g, b); // head
    br.rebuild();
    frames.stepLeft = br;
    // Step right.
    var br = new Brownie(renderer);
    br.set(0, 0, 1, r, g, b); // left foot
    br.set(2, 0, -1, r, g, b); // right foot
    br.set(1, 2, 0, r, g, b); // torso
    br.set(1, 3, 0, r, g, b);
    br.set(-1, 3, -1, r, g, b); // left hand
    br.set(3, 3, 1, r, g, b); // right hand
    br.set(1, 5, 0, r, g, b); // head
    br.rebuild();
    frames.stepRight = br;
    return {
        frames: frames,
        states: {
            default: {
                frames: ["standing"],
                speed: 1
            },
            standing: {
                frames: ["standing"],
                speed: 1
            },
            walking: {
                frames: ["standing", "stepLeft", "standing", "stepRight"],
                speed: 7
            }
        }
    };
}