
var radius = 10;

clear();
setCamera(0, 0.713, 27.45, radius, radius, radius);


for (var x = 0; x < radius * 2; x++) {
    for (var y = 0; y < radius * 2; y++) {
        for (var z = 0; z < radius * 2; z++) {
            var dx = radius - x;
            var dy = radius - y;
            var dz = radius - z;
            var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (d <= radius) {
                set(x, y, z, 0, 0.5, 1);
            }
        }
    }
}