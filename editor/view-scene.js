var Scene = function(canvasID) {

    "use strict";

    var self = this;

    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        vertexColors: THREE.VertexColors,
        specular: 0
    });

    self.initialize = function() {
        self.renderCanvas = document.getElementById(canvasID);
        self.renderer = null;
        self.scene = null;
        self.camera = null;
        self.light = null;
        self.brownie = null;
        self.mesh = null;
        self.board = null
        self.initializeRenderer();
        self.initializeScene();
    }

    self.initializeRenderer = function() {
        self.renderer = new THREE.WebGLRenderer({
            canvas: self.renderCanvas
        });
        self.renderer.setClearColor(0x555555);
    }

    self.initializeScene = function() {
        self.scene = new THREE.Scene();
        // Camera
        self.camera = new THREE.PerspectiveCamera(75, self.renderCanvas.width / self.renderCanvas.height, 0.1, 1000);
        self.camera.elevation = Math.PI / 4;
        self.camera.radius = 10.0;
        self.camera.angle = 0.0;
        self.camera.translation = new THREE.Vector3(0, 0, 0);
        // Board
        var t = THREE.ImageUtils.loadTexture("checkerboard.png");
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1000, 1000);
        var g = new THREE.PlaneGeometry(1, 1);
        var m = new THREE.MeshBasicMaterial({
            map: t,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        self.board = new THREE.Mesh(g, m);
        self.board.rotation.x = -Math.PI / 2;
        self.board.scale.set(2000, 2000, 1);
        self.board.position.y = -0.02;
        self.scene.add(self.board);
        // Light
        self.light = new THREE.PointLight({
            color: 0xffffff
        });
        self.light.position.set(10, 10, 20);
        self.scene.add(self.light);
    }

    self.setBrownie = function(brownie) {
        if (self.mesh !== null) {
            self.scene.remove(self.brownieMesh);
        }
        self.brownie = brownie;
        self.mesh = new THREE.Mesh(brownie.getGeometry(), material);
        self.scene.add(self.mesh);
    }

    self.getRenderer = function() {
        return self.renderer;
    }

    self.setCamera = function(angle, elevation, radius, x, y, z) {
        self.camera.angle = angle;
        self.camera.elevation = elevation;
        self.camera.radius = radius;
        self.camera.translation.set(x, y, z);
    }

    self.updateCamera = function() {
        self.camera.position.x = self.camera.radius * Math.cos(self.camera.angle) * Math.cos(self.camera.elevation);
        self.camera.position.y = self.camera.radius * Math.sin(self.camera.elevation);
        self.camera.position.z = self.camera.radius * Math.sin(self.camera.angle) * Math.cos(self.camera.elevation);
        var forward = new THREE.Vector3(0, 0, 0).sub(self.camera.position).normalize();
        var right = new THREE.Vector3(Math.cos(self.camera.angle + Math.PI / 2), 0, Math.sin(self.camera.angle + Math.PI / 2));
        self.camera.up = forward.clone().cross(right).normalize();
        self.camera.lookAt(new THREE.Vector3(0, 0, 0));
        self.camera.position.add(self.camera.translation);
    }

    self.setSize = function(width, height) {
        self.renderer.setSize(width, height);
        self.camera.aspect = width / height;
        self.camera.updateProjectionMatrix();
    }

    self.render = function() {
        self.updateCamera();
        self.renderer.render(self.scene, self.camera);
    }

    self.initialize();
}