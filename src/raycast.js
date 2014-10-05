function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

function castRay(eye, ray, range) {
    "use strict";

    var X = Math.floor(eye.x);
    var Y = Math.floor(eye.y);
    var Z = Math.floor(eye.z);

    var stepX = sign(ray.x);
    var stepY = sign(ray.y);
    var stepZ = sign(ray.z);

    var vx0 = Math.floor(eye.x);
    var vy0 = Math.floor(eye.y);
    var vz0 = Math.floor(eye.z);
    var vx1 = vx0 + 1;
    var vy1 = vy0 + 1;
    var vz1 = vz0 + 1;
    var tMaxX = Math.max((vx0 - eye.x) / ray.x, (vx1 - eye.x) / ray.x);
    var tMaxY = Math.max((vy0 - eye.y) / ray.y, (vy1 - eye.y) / ray.y);
    var tMaxZ = Math.max((vz0 - eye.z) / ray.z, (vz1 - eye.z) / ray.z);

    var tDeltaX = 1 / Math.abs(ray.x);
    var tDeltaY = 1 / Math.abs(ray.y);
    var tDeltaZ = 1 / Math.abs(ray.z);

    var list = [
        [X, Y, Z]
    ];

    var r2 = range * range;

    function distance() {
        var dx = tMaxX * stepX
        var dy = tMaxY * stepY
        var dz = tMaxZ * stepZ
        return dx * dx + dy * dy + dz * dz;
    }

    while(distance() < r2) {
        if (tMaxX < tMaxY) {
            if (tMaxX < tMaxZ) {
                X = X + stepX;
                tMaxX = tMaxX + tDeltaX;
            } else {
                Z = Z + stepZ;
                tMaxZ = tMaxZ + tDeltaZ;
            }
        } else {
            if (tMaxY < tMaxZ) {
                Y = Y + stepY;
                tMaxY = tMaxY + tDeltaY;
            } else {
                Z = Z + stepZ;
                tMaxZ = tMaxZ + tDeltaZ;
            }
        }
        list.push([X, Y, Z]);
    }
    return list;
}