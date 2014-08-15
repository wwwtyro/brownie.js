
var radius = 10;

clear();
setCamera(23.645, 29.900, 29.773, -2.167, -0.668);

for (var x = 0; x < radius * 2; x++) {
    for (var y = 0; y < radius * 2; y++) {
        for (var z = 0; z < radius * 2; z++) {
            var dx = radius - x - 0.5;
            var dy = radius - y - 0.5;
            var dz = radius - z - 0.5;
            var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (d <= radius) {
                set(x, y, z, 0, 0.5, 1);
            }
        }
    }
}