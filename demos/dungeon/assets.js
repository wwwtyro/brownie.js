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
                var d = Math.sqrt(dx * dx + dz * dz);
                if (d <= radius) {
                    if (y === 0 || br.get(i, y - 1, j)) {
                        br.set(i, y, j, r, g, b);
                    }
                }
            }
        }
    }
    var radius = height / 8;
    var y = 0;
    while (radius > height / 32) {
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


function spiderGenerator() {

    function makeSpider(a1, a2, a3, a4, a5, a6, a7, a8) {

        var br = new Brownie(renderer);
        var scale = 1;
        var jointRadius = 1;
        var kneeDistance = 8;
        var footDistance = 16;
        var kneeHeight = 2;
        var footHeight = -6;
        var torsoRadius = 4;


        function newJoint(x, y, z, radius, r, g, b) {
            return {
                x: x * scale,
                y: y * scale,
                z: z * scale,
                radius: radius * scale,
                r: r,
                g: g,
                b: b
            };
        }

        var torso, lk1, lk2, lk3, lk4, rk1, rk2, rk3, rk4,
            lf1, lf2, lf3, lf4, rf1, rf2, rf3, rf4;

        function makeJoints(l1, l2, l3, l4, r1, r2, r3, r4) {
            torso = newJoint(0, 0, 0, torsoRadius, 0, 0, 0);

            lk1 = newJoint(scale * kneeDistance * Math.cos(l1), scale * kneeHeight, scale * kneeDistance * -Math.sin(l1), 1, 0, 0, 0);
            lk2 = newJoint(scale * kneeDistance * Math.cos(l2), scale * kneeHeight, scale * kneeDistance * -Math.sin(l2), 1, 0, 0, 0);
            lk3 = newJoint(scale * kneeDistance * Math.cos(l3), scale * kneeHeight, scale * kneeDistance * -Math.sin(l3), 1, 0, 0, 0);
            lk4 = newJoint(scale * kneeDistance * Math.cos(l4), scale * kneeHeight, scale * kneeDistance * -Math.sin(l4), 1, 0, 0, 0);

            rk1 = newJoint(scale * kneeDistance * Math.cos(-r1), scale * kneeHeight, scale * kneeDistance * -Math.sin(-r1), 1, 0, 0, 0);
            rk2 = newJoint(scale * kneeDistance * Math.cos(-r2), scale * kneeHeight, scale * kneeDistance * -Math.sin(-r2), 1, 0, 0, 0);
            rk3 = newJoint(scale * kneeDistance * Math.cos(-r3), scale * kneeHeight, scale * kneeDistance * -Math.sin(-r3), 1, 0, 0, 0);
            rk4 = newJoint(scale * kneeDistance * Math.cos(-r4), scale * kneeHeight, scale * kneeDistance * -Math.sin(-r4), 1, 0, 0, 0);

            lf1 = newJoint(scale * footDistance * Math.cos(l1), scale * footHeight, scale * footDistance * -Math.sin(l1), 1, 0, 0, 0);
            lf2 = newJoint(scale * footDistance * Math.cos(l2), scale * footHeight, scale * footDistance * -Math.sin(l2), 1, 0, 0, 0);
            lf3 = newJoint(scale * footDistance * Math.cos(l3), scale * footHeight, scale * footDistance * -Math.sin(l3), 1, 0, 0, 0);
            lf4 = newJoint(scale * footDistance * Math.cos(l4), scale * footHeight, scale * footDistance * -Math.sin(l4), 1, 0, 0, 0);

            rf1 = newJoint(scale * footDistance * Math.cos(-r1), scale * footHeight, scale * footDistance * -Math.sin(-r1), 1, 0, 0, 0);
            rf2 = newJoint(scale * footDistance * Math.cos(-r2), scale * footHeight, scale * footDistance * -Math.sin(-r2), 1, 0, 0, 0);
            rf3 = newJoint(scale * footDistance * Math.cos(-r3), scale * footHeight, scale * footDistance * -Math.sin(-r3), 1, 0, 0, 0);
            rf4 = newJoint(scale * footDistance * Math.cos(-r4), scale * footHeight, scale * footDistance * -Math.sin(-r4), 1, 0, 0, 0);
        }

        makeJoints(a1, a2, a3, a4, a5, a6, a7, a8);

        var joints = [
            torso,
            lk1, lk2, lk3, lk4, rk1, rk2, rk3, rk4,
            lf1, lf2, lf3, lf4, rf1, rf2, rf3, rf4
        ];

        var bones = [
            [torso, lk1],
            [torso, lk2],
            [torso, lk3],
            [torso, lk4],
            [torso, rk1],
            [torso, rk2],
            [torso, rk3],
            [torso, rk4],
            [lk1, lf1],
            [lk2, lf2],
            [lk3, lf3],
            [lk4, lf4],
            [rk1, rf1],
            [rk2, rf2],
            [rk3, rf3],
            [rk4, rf4],
        ];

        function sphere(x, y, z, radius, r, g, b) {
            for (var i = x - radius; i <= x + radius; i++) {
                for (var j = y - radius; j <= y + radius; j++) {
                    for (var k = z - radius; k <= z + radius; k++) {
                        var dx = i - x;
                        var dy = j - y;
                        var dz = k - z;
                        var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (d <= radius) {
                            br.set(i, j, k, r, g, b);
                        }
                    }
                }
            }
        }

        function line(x1, y1, z1, x2, y2, z2, radius, r, g, b) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            var dz = z2 - z1;
            var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            var steps = Math.ceil(d);
            var step = 1 / steps;
            for (var i = 0; i < steps; i++) {
                var x = x1 + dx * step * i;
                var y = y1 + dy * step * i;
                var z = z1 + dz * step * i;
                sphere(x, y, z, radius, r, g, b);
            }
        }

        for (var i = 0; i < joints.length; i++) {
            var j = joints[i];
            sphere(j.x, j.y, j.z, j.radius, j.r, j.g, j.b);
        }

        for (var i = 0; i < bones.length; i++) {
            var a = bones[i][0];
            var b = bones[i][1];
            line(a.x, a.y, a.z, b.x, b.y, b.z, 1 * scale, 0.25, 0.25, 0.25)
        }

        br.rebuild();
        return br;
    }

    var frames = {}

    frames.standing = makeSpider(1 / 5 * Math.PI, 2 / 5 * Math.PI, 3 / 5 * Math.PI, 4 / 5 * Math.PI, 1 / 5 * Math.PI, 2 / 5 * Math.PI, 3 / 5 * Math.PI, 4 / 5 * Math.PI);
    frames.stepLeft = makeSpider(1 / 10 * Math.PI, 2 / 5 * Math.PI, 5 / 10 * Math.PI, 4 / 5 * Math.PI, 1 / 5 * Math.PI, 3 / 10 * Math.PI, 3 / 5 * Math.PI, 7 / 10 * Math.PI);
    frames.stepRight = makeSpider(1 / 5 * Math.PI, 3 / 10 * Math.PI, 3 / 5 * Math.PI, 7 / 10 * Math.PI, 1 / 10 * Math.PI, 2 / 5 * Math.PI, 5 / 10 * Math.PI, 4 / 5 * Math.PI);
    frames.default = frames.standing;

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
                speed: 4
            }
        }
    };
}