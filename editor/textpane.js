function TextPane() {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.canvas = document.createElement("canvas");
        self.ctx = self.canvas.getContext("2d");
        self.texture = new THREE.Texture(self.canvas);
        self.texture.needsUpdate = true;
        var g = new THREE.PlaneGeometry(1, 1, 1, 1);
        var m = new THREE.MeshBasicMaterial({
            map: self.texture,
            side: THREE.DoubleSide,
            transparent: true
        });
        self.mesh = new THREE.Mesh(g, m);
    };

    self.print = function(text, color) {
        var width = self.ctx.measureText(text).width;
        self.canvas.height = 64;
        self.canvas.width = 1;
        while (self.canvas.width < width) {
            self.canvas.width *= 2;
        }
        self.ctx.textAlign = "center";
        self.ctx.textBaseline = "middle";
        self.ctx.font = "64px arial";
        self.ctx.fillStyle = color;
        self.ctx.fillText(text, self.canvas.width/2, self.canvas.height/2);
        self.mesh.scale.set(self.canvas.width/64, 1, 1);
        self.texture.needsUpdate = true;
    }

    self.initialize();
}