"use strict";

var scene, mesh, frozenMesh, camera, renderer, dummy, trackball;

var perfs = {};

function perf(label) {
    if (label in perfs) {
        console.log(label, Math.round(performance.now() - perfs[label]), "ms");
        delete perfs[label];
        return;
    }
    perfs[label] = performance.now();
}

window.onload = function() {

    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    trackball = new Trackball(renderCanvas);

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas,
        antialias: false
    });
    renderer.setClearColor(0x555555);

    scene = new THREE.Scene();

    dummy = new THREE.Object3D();
    scene.add(dummy);

    var width = 16;
    var height = width * 2;
    var base_height = width/8;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, width * 2.5);

    var brownie = new Brownie();

    var pn = new PerlinNoise("foo");

    var s = 0.5;
    perf("Build column");
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            for (var z = 0; z < width; z++) {
                if (y >= base_height && y < height - base_height) {
                    var dx = x - width/2 + 0.5;
                    var dz = z - width/2 + 0.5;
                    var d = Math.sqrt(dx*dx + dz*dz);
                    if (d > width/4) {
                        continue;
                    }
                }
                var off = pn.noise(x * s, y*s, z * s) * 4;
                var c = (0.5 + 0.5 * (Math.sin(x * s + off))) * 0.5 + 0.5;
                brownie.set(x, y, z, c, c, c);
            }
        }
    }
    perf("Build column");



    perf("Mesh");
    brownie.rebuild();
    perf("Mesh");

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: whiteTexture,
        vertexColors: THREE.VertexColors
    });

    mesh = new THREE.Mesh(brownie.getGeometry(), m);
    mesh.position.x = -width - width / 2;
    mesh.position.y = -height / 2;
    mesh.position.z = -width / 2;
    dummy.add(mesh);

    perf("Calculate AO");
    brownie.calculateAO(100, width, 1.0);
    perf("Calculate AO");

    perf("Smooth AO");
    for (var i = 0; i < 2; i++) {
        brownie.antialiasAO();
    }
    perf("Smooth AO");

    frozenMesh = chewBrownie(brownie.freeze());
    frozenMesh.position.x += width / 2;
    frozenMesh.position.y = -height / 2;
    frozenMesh.position.z = -width / 2;
    dummy.add(frozenMesh);


    console.log(mesh.geometry.attributes.position.array.length / 9);
    console.log(frozenMesh.geometry.attributes.position.array.length / 9);


    var light = new THREE.PointLight({
        color: 0xffffff
    });
    light.position.set(0, 0, width * 2);
    scene.add(light);

    animate();
}


function animate() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, true);

    var rot = trackball.getSmoothRotation();
    dummy.rotation.setFromQuaternion(rot);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


var Trackball = function(element) {

    var self = this;

    self.initialize = function() {
        self.rotationMatrix = new THREE.Matrix4();
        self.smoothRotation = new THREE.Quaternion();
        self.lastx = null;
        self.lasty = null;
        self.button = false;
        element.addEventListener("mousedown", self.mousedown, false);
        window.addEventListener("mouseup", self.mouseup, false);
        window.addEventListener("mousemove", self.mousemove, false);
    }

    self.mousedown = function(e) {
        self.button = true;
        self.lastx = e.screenX;
        self.lasty = e.screenY;
        element.style.cursor = "none";
    }

    self.mouseup = function(e) {
        self.button = false;
        element.style.cursor = "default";
    }

    self.mousemove = function(e) {
        if (!self.button) {
            return;
        }
        var dx = e.screenX - self.lastx;
        var dy = e.screenY - self.lasty;
        self.lastx = e.screenX;
        self.lasty = e.screenY;
        var tempMat = new THREE.Matrix4();
        tempMat.makeRotationAxis(new THREE.Vector3(0, 1, 0), dx * 0.005);
        tempMat.multiply(self.rotationMatrix);
        var tempMat2 = new THREE.Matrix4();
        tempMat2.makeRotationAxis(new THREE.Vector3(1, 0, 0), dy * 0.005);
        tempMat2.multiply(tempMat);
        self.rotationMatrix = tempMat2;
    };

    self.getSmoothRotation = function() {
        var target = new THREE.Quaternion().setFromRotationMatrix(self.rotationMatrix);
        self.smoothRotation.slerp(target, 0.25);
        return self.smoothRotation;
    }

    self.initialize();
}