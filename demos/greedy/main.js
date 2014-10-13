"use strict";

var scene, mesh, frozenMesh, camera, renderer, dummy, trackball;

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



    var size = 16;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, size*2.5);

    var brownie = new Brownie();

    // for (var x = 0; x < size; x++) {
    //     for (var y = 0; y < size; y++) {
    //         for (var z = 0; z < size; z++) {
    //             brownie.set(x, y, z, 0, Math.random(), 1.0);
    //         }
    //     }
    // }

    // brownie.set(0, 0, 0, 1, 0, 0);
    // brownie.set(0, 1, 0, 0, 1, 0);
    // brownie.set(1, 0, 0, 0, 0, 1);
    // brownie.set(1, 1, 0, 1, 0, 0);
    // brownie.set(3, 0, 0, 0, 0, 0);
    // brownie.set(0, 3, 0, 0, 0, 0);
    // brownie.set(3, 3, 0, 0, 0, 0);

    // var count = 0;
    // for (var i = 0; i < 1; i++) {
    //     var x0 = Math.round(Math.random() * size);
    //     var x1 = x0 + Math.round(Math.random() * size/4);
    //     var y0 = Math.round(Math.random() * size);
    //     var y1 = y0 + Math.round(Math.random() * size/4);
    //     var r = Math.random() * 0.5 + 0.5;
    //     var g = Math.random() * 0.5 + 0.5;
    //     var b = Math.random() * 0.5 + 0.5;
    //     for (var x = x0; x <= x1; x++) {
    //         for (var y = y0; y <= y1; y++) {
    //             if (!brownie.get(x, y, 0)) {
    //                 count++;
    //             }
    //             brownie.set(x, y, 0, r, g, b);
    //         }
    //     }
    // }

    for (var i = 0; i < size * size * size*32; i++) {
        var x = Math.round(Math.random() * size);
        var y = Math.round(Math.random() * size);
        var z = Math.round(Math.random() * size);
        var r = Math.random() * 0.5 + 0.5;
        var g = Math.random() * 0.5 + 0.5;
        var b = Math.random() * 0.5 + 0.5;
        brownie.set(x, y, z, r, g, b);
    }

    brownie.chunk.calculateAO(100, size, 1.0);
    // brownie.chunk.antialiasAO();

    // brownie.set(0, 0, 0, 1, 0, 0);
    // brownie.set(0, 1, 0, 1, 0, 0);
    // brownie.set(1, 0, 0, 0, 1, 0);
    // brownie.set(1, 1, 0, 0, 1, 0);
    // brownie.set(1, 0, 1, 0, 0, 1);
    // brownie.set(1, 1, 1, 0, 0, 1);
    // brownie.set(0, 0, 1, 1, 1, 0);
    // brownie.set(0, 1, 1, 1, 1, 0);
    // brownie.set(1, 0, 0, 0, 0, 0);

    // brownie.set(3, 0, 0, 0, 0, 0);
    // brownie.set(3, 1, 0, 0, 0, 0);
    // brownie.set(4, 0, 0, 0, 0, 0);

    frozenMesh = brownie.chunk.freeze();
    frozenMesh.position.x += size/2;
    frozenMesh.position.y = -size/2;
    frozenMesh.position.z = -size/2;
    dummy.add(frozenMesh);
    // assplode;

    brownie.rebuild();

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: whiteTexture,
        vertexColors: THREE.VertexColors
    });

    mesh = new THREE.Mesh(brownie.getGeometry(), m);
    mesh.position.x = -size - size/2;
    mesh.position.y = -size/2;
    mesh.position.z = -size/2;

    dummy.add(mesh);

    console.log(mesh.geometry.attributes.position.array.length/9);
    console.log(frozenMesh.geometry.attributes.position.array.length/9);


    var light = new THREE.PointLight({
        color: 0xffffff
    });
    light.position.set(0, 0, size*2);
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

