var GeometryManager = function(glContext) {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.gl = glContext;
        self.geometry = new THREE.BufferGeometry();
        self.geometry.addAttribute('position', new THREE.Float32Attribute(0, 3));
        self.geometry.addAttribute('normal', new THREE.Float32Attribute(0, 3));
        self.geometry.addAttribute('color', new THREE.Float32Attribute(0, 3));
        self.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);
    }

    self.dispose = function() {
        self.geometry.dispose();
    }

    self.updateAttribute = function(attrib) {
        self.gl.deleteBuffer(attrib.buffer);
        attrib.buffer = self.gl.createBuffer();
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, attrib.buffer);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, attrib.array, self.gl.DYNAMIC_DRAW);
    }

    self.updateAttributeBuffer = function(attrib, updates) {
        for (var i = 0; i < updates.length; i++) {
            var l = updates[i][0];
            var r = updates[i][1];
            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, attrib.buffer);
            var view = attrib.array.subarray(l, r);
            self.gl.bufferSubData(self.gl.ARRAY_BUFFER, l * attrib.array.BYTES_PER_ELEMENT, view);
        }
    }

    self.rebuild = function(updates) {
        var position = self.geometry.attributes.position;
        if (position.array != updates.positions) {
            position.array = updates.positions;
            self.updateAttribute(position);
        } else {
            self.updateAttributeBuffer(position, updates.updates);
        }
        var normal = self.geometry.attributes.normal;
        if (normal.array != updates.normals) {
            normal.array = updates.normals;
            self.updateAttribute(normal);
        } else {
            self.updateAttributeBuffer(normal, updates.updates);
        }
        var color = self.geometry.attributes.color;
        if (color.array != updates.colors) {
            color.array = updates.colors;
            self.updateAttribute(color);
        } else {
            self.updateAttributeBuffer(color, updates.updates);
        }
    }

    self.initialize();

}
