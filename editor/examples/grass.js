
clear();

for (var x = 0; x < 16; x++) {
    for (var z = 0; z < 16; z++) {
        var y = 0;
        set(x, y, z, 0, Math.random() * 0.5 + 0.5, 0);
    }
}