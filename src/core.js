var Brownie = function() {

    "use strict";

    var self = this;

    self.initialize = function() {
        self.chunk = new Chunk();
        self.geometry = new THREE.BufferGeometry();
        var a3 = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1]);
        var a2 = new Float32Array([1, 1, 1, 1, 1, 1]);
        self.geometry.addAttribute('position', new THREE.BufferAttribute(a3, 3));
        self.geometry.addAttribute('normal', new THREE.BufferAttribute(a3, 3));
        self.geometry.addAttribute('color', new THREE.BufferAttribute(a3, 3));
        self.geometry.addAttribute('uv', new THREE.BufferAttribute(a2, 2));
        self.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);
    };

    self.set = function(x, y, z, r, g, b) {
        self.chunk.set(x, y, z, r, g, b);
    };

    self.unset = function(x, y, z) {
        self.chunk.unset(x, y, z);
    };

    self.get = function(x, y, z) {
        return self.chunk.get(x, y, z);
    };

    self.getBounds = function() {
        return self.chunk.getBounds();
    };

    self.getCentroid = function() {
        return self.chunk.getCentroid();
    };

    self.rebuild = function() {
        var arrays = self.chunk.genArrays();
        self.geometry.attributes.position.array = arrays.positions;
        self.geometry.attributes.normal.array = arrays.normals;
        self.geometry.attributes.color.array = arrays.colors;
        self.geometry.attributes.uv.array = arrays.uvs;
        self.geometry.attributes.position.needsUpdate = true;
        self.geometry.attributes.normal.needsUpdate = true;
        self.geometry.attributes.color.needsUpdate = true;
        self.geometry.attributes.uv.needsUpdate = true;
    };

    self.getGeometry = function() {
        return self.geometry;
    };

    self.toJSON = function() {
        // XXX: This needs to be refactored - should return JSON string, not object.
        var json = [];
        for (var i in self.chunk.voxels) {
            var v = self.chunk.voxels[i];
            json.push({
                x: v.x,
                y: v.y,
                z: v.z,
                r: Math.floor(v.r * 1000) / 1000,
                g: Math.floor(v.g * 1000) / 1000,
                b: Math.floor(v.b * 1000) / 1000
            });
        }
        return json;
    };

    self.fromJSON = function(json) {
        // XXX: This needs to be refactored - should take JSON string, not object.
        for (var i = 0; i < json.length; i++) {
            var v = json[i];
            self.chunk.set(v.x, v.y, v.z, v.r, v.g, v.b);
        }
    }

    self.dispose = function() {
        self.geometry.dispose();
    };

    self.blit = function(source, x, y, z) {
        for (var k in source.chunk.voxels) {
            var v = source.chunk.voxels[k];
            self.set(v.x + x, v.y + y, v.z + z, v.r, v.g, v.b);
        }
    };

    self.calculateAO = function(samples, range, depth, progress) {
        self.chunk.calculateAO(samples, range, depth, progress);
    };

    self.antialiasAO = function() {
        self.chunk.antialiasAO();
    };

    self.freeze = function() {
        var data = self.chunk.freeze();
        var zip = new JSZip();
        var canvas = zip.folder("canvas");
        canvas.file("data", new Uint8Array(data.canvas.data));
        var metadata = JSON.stringify({
            width: data.canvas.width,
            height: data.canvas.height
        });
        canvas.file("metadata", metadata);
        zip.file("quads", JSON.stringify(data.quads));
        return zip.generate({type: "uint8array", compression: "DEFLATE"});
    }

    self.initialize();

};

function chewBrownie(zipped) {
    // Load everything from the zipped data.
    var zip = JSZip();
    zip.load(zipped);
    var fcanvas = zip.folder("canvas");
    var metadata = JSON.parse(fcanvas.file("metadata").asText());
    var data = {};
    data.canvas = new Canvas(metadata.width, metadata.height);
    data.canvas.data = new Uint8ClampedArray(fcanvas.file("data").asUint8Array());
    data.quads = JSON.parse(zip.file("quads").asText());

    // Convert the frozen brownie data.canvas to an html5 canvas.
    var canvas = document.createElement("canvas");
    canvas.width = data.canvas.width;
    canvas.height = data.canvas.height;
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var rgba = data.canvas.toRGBA();
    for (var i = 0; i < rgba.length; i++) {
        imageData.data[i] = rgba[i];
    }
    ctx.putImageData(imageData, 0, 0);

    // Create a texture from it.
    var texture = new THREE.Texture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
    });

    // Create a buffer geometry from the data.rects.
    var g = new THREE.BufferGeometry();
    var positions = [];
    var normals = [];
    var uvs = [];
    for (var i = 0; i < data.quads.length; i++) {
        var r = data.quads[i];
        positions.push.apply(positions, r.positions[0]);
        positions.push.apply(positions, r.positions[1]);
        positions.push.apply(positions, r.positions[2]);
        positions.push.apply(positions, r.positions[0]);
        positions.push.apply(positions, r.positions[2]);
        positions.push.apply(positions, r.positions[3]);
        normals.push.apply(normals, r.normal);
        normals.push.apply(normals, r.normal);
        normals.push.apply(normals, r.normal);
        normals.push.apply(normals, r.normal);
        normals.push.apply(normals, r.normal);
        normals.push.apply(normals, r.normal);
        var top = r.uvs[0] / data.canvas.height;
        var left = r.uvs[1] / data.canvas.width;
        var bottom = r.uvs[2] / data.canvas.height;
        var right = r.uvs[3] / data.canvas.width;
        uvs.push.apply(uvs, [left, bottom]);
        uvs.push.apply(uvs, [right, bottom]);
        uvs.push.apply(uvs, [right, top]);
        uvs.push.apply(uvs, [left, bottom]);
        uvs.push.apply(uvs, [right, top]);
        uvs.push.apply(uvs, [left, top]);
    }
    g.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    g.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    g.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e38);

    return new THREE.Mesh(g, m);
}