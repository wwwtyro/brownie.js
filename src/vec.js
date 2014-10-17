var Vec3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Vec3.prototype = {

    clone: function() {
        return new Vec3(this.x, this.y, this.z);
    },

    times: function(a) {
        if (typeof a === "number") {
            return new Vec3(a * this.x, a * this.y, a * this.z);
        } else {
            return new Vec3(a.x * this.x, a.y * this.y, a.z * this.z);
        }
    },

    plus: function(a) {
        if (typeof a === "number") {
            return new Vec3(a + this.x, a + this.y, a + this.z);
        } else {
            return new Vec3(a.x + this.x, a.y + this.y, a.z + this.z);
        }
    },

    minus: function(a) {
        if (typeof a === "number") {
            return new Vec3(this.x - a, this.y - a, this.z - a);
        } else {
            return new Vec3(this.x - a.x, this.y - a.y, this.z - a.z);
        }
    }

}