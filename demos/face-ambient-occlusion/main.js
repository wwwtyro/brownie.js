"use strict";

var scene, noaomesh, aomesh, camera, renderer, dummy, trackball;

var size = 32;

$.getJSON("model.json", function(baked) {

    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    trackball = new Trackball(renderCanvas);
    trackball.rotationMatrix.makeRotationX(1.0);

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas,
        antialias: true
    });
    renderer.setClearColor(0xaeaeae);

    scene = new THREE.Scene();

    dummy = new THREE.Object3D();
    scene.add(dummy);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, size*2);

    var brownie = new Brownie();
    brownie.chunk.voxels = baked;
    brownie.rebuild();

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: ambientOcclusionTexture,
        specular: 0,
        vertexColors: THREE.VertexColors
    });

    aomesh = new THREE.Mesh(brownie.getGeometry(), m);
    aomesh.position.set(-size/2, 0, -size/2);

    for (var key in baked) {
        var v = baked[key];
        v.faces.top.ao = 0;
        v.faces.bottom.ao = 0;
        v.faces.left.ao = 0;
        v.faces.right.ao = 0;
        v.faces.front.ao = 0;
        v.faces.back.ao = 0;
    }

    var brownie = new Brownie();
    brownie.chunk.voxels = baked;
    brownie.rebuild();

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: whiteTexture,
        specular: 0,
        vertexColors: THREE.VertexColors
    });

    noaomesh = new THREE.Mesh(brownie.getGeometry(), m);
    noaomesh.position.set(-size/2, 0, -size/2);

    window.onresize = function() {
        console.log("foo");
    }

    $("#loading").hide();

    animate();
});

function animate() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, true);
    dummy.remove(noaomesh);
    dummy.remove(aomesh);
    if (document.getElementById("ao-checkbox").checked) {
        dummy.add(aomesh);
    } else {
        dummy.add(noaomesh);
    }
    dummy.rotation.setFromQuaternion(trackball.getSmoothRotation());
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

