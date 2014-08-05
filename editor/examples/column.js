
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
    var cut = Math.random() * 1;
}

column();