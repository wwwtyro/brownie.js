
clear();

function shroom(size, x, y, z) {
    var r = Math.random() * 0.5 + 0.5;
    var g = Math.random() * 0.5 + 0.5;
    var b = Math.random() * 0.5 + 0.5;
    for (var j = 0; j < size; j++) {
        for (var i = x-size; i < x + size; i++) {
            for (var k = z - size; k < z + size; k++) {
                var dx = x - i;
                var dz = z - k;
                var d = Math.sqrt(dx*dx + dz*dz);
                if (j < size*0.5) {
                    if (d < size * 0.125) {
                        set(i,j,k, r,g,b);
                    }
                } else {
                    if (d < size * (size-j)/size) {
                        set(i,j,k, r,g,b);
                    }
                }
            }
        }
    }
}

for (var i = 0; i < 10; i++) {
    var x = Math.random() - 0.5;
    var z = Math.random() - 0.5;
    var l = Math.sqrt(x*x + z*z) * (Math.random() * 0.1 + 0.9);
    x /= l;
    z /= l;
    shroom(Math.random()*12+8, x * 32, 0, z * 32);
}
