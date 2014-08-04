var Brownie = function(renderer) {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.vm = new VoxelManager();
        self.gm = new GeometryManager(renderer.getContext())
    };

    self.set = function(x, y, z, r, g, b) {
        self.vm.set(x, y, z, r, g, b);
    };

    self.unset = function(x, y, z, r, g, b) {
        self.vm.unset(x, y, z, r, g, b);
    };

    self.get = function(x, y, z) {
        return self.vm.get(x, y, z);
    };

    self.getBounds = function() {
        return self.vm.getBounds();
    };

    self.getCentroid = function() {
        return self.vm.getCentroid();
    };

    self.rebuild = function() {
        self.vm.rebuild();
        var updates = self.vm.getUpdates();
        self.gm.rebuild(updates);
    };

    self.getGeometry = function() {
        return self.gm.geometry;
    };

    self.toJSON = function() {
        return self.vm.toJSON();
    };

    self.fromJSON = function(json) {
        self.vm.fromJSON(json);
    }

    self.dispose = function() {
        self.gm.dispose();
    };

    self.initialize();
    
};
