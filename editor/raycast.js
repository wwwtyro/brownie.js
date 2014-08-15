function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

function castRay(eye, ray, count) {

    "use strict";

    ray = ray.clone().normalize();

    ray.x = ray.x == 0 ? 0.000000001 : ray.x;
    ray.y = ray.y == 0 ? 0.000000001 : ray.y;
    ray.z = ray.z == 0 ? 0.000000001 : ray.z;

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

    var voxelList = [
        [X, Y, Z]
    ];

    var tMin = Math.min(tMaxX, tMaxY, tMaxZ);
    var pointList = [
        [tMin * ray.x + eye.x, tMin * ray.y + eye.y, tMin * ray.z + eye.z]
    ];

    for (var i = 0; i < count - 1; i++) {
        if (tMaxX < tMaxY) {
            if (tMaxX < tMaxZ) {
                tMin = tMaxX;
                X = X + stepX;
                tMaxX = tMaxX + tDeltaX;
            } else {
                tMin = tMaxZ;
                Z = Z + stepZ;
                tMaxZ = tMaxZ + tDeltaZ;
            }
        } else {
            if (tMaxY < tMaxZ) {
                tMin = tMaxY;
                Y = Y + stepY;
                tMaxY = tMaxY + tDeltaY;
            } else {
                tMin = tMaxZ;
                Z = Z + stepZ;
                tMaxZ = tMaxZ + tDeltaZ;
            }
        }
        voxelList.push([X, Y, Z]);
        pointList.push([tMin * ray.x + eye.x, tMin * ray.y + eye.y, tMin * ray.z + eye.z]);
    }

    return {
        voxels: voxelList,
        points: pointList
    };

}