"use strict";

var scene, camera, renderer, light, shadowLight, stage, player;
var aFloor, aWall, aHuman, aStalagmite, aSpider;
var entities = [];
var floors = {};

var range = 4;

var tick = 0;

window.onload = function() {
    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas,
        antialias: true
    });
    renderer.setClearColor(0x000000);
    renderer.shadowMapEnabled = true;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

    shadowLight = new THREE.SpotLight(0xffffff, 2, 0);
    shadowLight.angle = Math.PI / 2;
    shadowLight.exponent = 0.0;
    shadowLight.castShadow = true;
    shadowLight.shadowMapWidth = 1024;
    shadowLight.shadowMapHeight = 1024;
    shadowLight.shadowCameraNear = 0.1;
    shadowLight.shadowCameraFar = 10;
    shadowLight.shadowCameraFov = 140;
    shadowLight.onlyShadow = true;
    shadowLight.shadowBias = 0.0;
    shadowLight.shadowDarkness = 1;
    shadowLight.height = 2;
    shadowLight.target = new THREE.Object3D();
    scene.add(shadowLight);


    light = new THREE.PointLight(0xffffff, 2, range);
    light.height = 0.5;
    light.intensity = Math.random() + 2;
    light.targetIntensity = Math.random() + 2;
    scene.add(light);

    stage = new Stage();
    scene.add(stage.root);

    aFloor = new Asset(floorAsset);
    aFloor.setInternalAlignment(0, -1, 0);

    aWall = new Asset(wallAsset);
    aWall.setInternalAlignment(0, 1, 0);

    aStalagmite = new Asset(stalagmiteAsset);
    aStalagmite.setInternalAlignment(0, 1, 0);
    aStalagmite.setInternalScale("y", 2);

    aHuman = new Asset(humanAsset);
    aHuman.setInternalAlignment(0, 1, 0);
    aHuman.setInternalScale("y", 0.25);

    aSpider = new Asset(spiderGenerator);
    aSpider.setInternalAlignment(0, 1, 0);
    aSpider.setInternalScale("y", 0.125);

    player = new Entity(aHuman);
    player.state = "standing";

    for (var i = -range; i <= range; i++) {
        for (var j = -range; j <= range; j++) {
            var floor = new Entity(aFloor);
            floors[[i, j]] = floor;
        }
    }

    window.onresize = onResize;
    animate();
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function getPlayerBlock() {
    return {
        x: Math.round(player.position.x),
        z: Math.round(player.position.z)
    };
}

var blocks = {}

function getBlock(x, z) {
    if (!blocks[[x, z]]) {
        var block = [];
        block.push(aFloor);
        if (Math.random() < 0.1) {
            block.push(aWall);
        } else if (Math.random() < 0.1) {
            block.push(aStalagmite);
        }
        blocks[[x, z]] = block;
    }
    return blocks[[x, z]];
}

function drawStage() {
    stage.clear();
    var pb = getPlayerBlock();
    for (var x = pb.x - range; x <= pb.x + range; x++) {
        for (var z = pb.z - range; z <= pb.z + range; z++) {
            var block = getBlock(x, z);
            for (var i = 0; i < block.length; i++) {
                var asset = block[i];
                // stage.blit(asset, "default", 0, new THREE.Vector3(x, 0, z), new THREE.Vector3(), new THREE.Vector3(1, 1, 1));
            }
        }
    }
    stage.blit(player);
    // stage.blit(aSpider, "default", 0, new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(1, 1, 1));
}

function keyOn(key) {
    return _.contains(KeyboardJS.activeKeys(), key)
}

function updatePlayerPosition() {
    player.state = "standing";
    player.forward = new THREE.Vector3(Math.cos(player.rotation.y), 0, Math.sin(player.rotation.y));
    var up = new THREE.Vector3(0, 1, 0);
    var right = up.clone().cross(player.forward);
    var speed = 0.02;
    if (keyOn('up') || keyOn('w')) {
        player.position.add(player.forward.clone().multiplyScalar(speed))
        player.state = "walking";
    }
    if (keyOn('down') || keyOn('s')) {
        player.position.sub(player.forward.clone().multiplyScalar(speed))
        player.state = "walking";
    }
    if (keyOn('left') || keyOn('a')) {
        player.rotation.y -= speed;
        player.state = "walking";
    }
    if (keyOn('right') || keyOn('d')) {
        player.rotation.y += speed;
        player.state = "walking";
    }
}

function animate() {
    tick++;
    updatePlayerPosition();
    player.update();
    shadowLight.target.position = player.position.clone();
    shadowLight.position = player.position.clone();
    shadowLight.position.y = shadowLight.height;
    light.position = player.position.clone();
    light.position.y = shadowLight.height;
    light.intensity += (light.targetIntensity - light.intensity) * 0.1;
    if (Math.random() < 0.1) {
        light.targetIntensity = Math.random() + 2;
    }
    var cameraTargetPosition = player.position.clone().sub(player.forward.clone().multiplyScalar(range / 2)).add(new THREE.Vector3(0, range / 2, 0));
    camera.position.add(cameraTargetPosition.sub(camera.position.clone()).multiplyScalar(0.1));
    camera.lookAt(player.position);
    drawStage();
    renderer.render(scene, camera);
    renderer.render(scene, camera);
    stage.clear();
    requestAnimationFrame(animate);
}


var Entity = function(asset) {

    var self = this;

    self.initialize = function() {
        self.asset = asset;
        self.state = "default";
        self.tick = 0;
        self.position = new THREE.Vector3();
        self.rotation = new THREE.Vector3();
        self.scale = new THREE.Vector3(1, 1, 1);
    }

    self.update = function() {
        self.tick++;
    }

    self.reset = function() {
        self.tick = 0;
    }

    self.initialize();
}

var Stage = function() {

    var self = this;

    self.initialize = function() {
        self.root = new THREE.Object3D();
    }

    self.blit = function(entity) {
        var m = entity.asset.getMesh(entity.state, entity.tick);
        m.position.set(entity.position.x, entity.position.y, entity.position.z);
        m.rotation.set(entity.rotation.x, entity.rotation.y, entity.rotation.z);
        m.scale.set(entity.scale.x, entity.scale.y, entity.scale.z);
        m.children[0].castShadow = true;
        m.children[0].receiveShadow = true;
        self.root.add(m);
    }

    self.clear = function() {
        var children = self.root.children.slice();
        for (var i in children) {
            var c = children[i];
            self.root.remove(c);
            c.release();
        }
    }

    self.initialize();
}




var Asset = function(generator) {

    var self = this;

    self.initialize = function() {
        self.brownies = generator();
        self.meshPool = {};
        self.material = new THREE.MeshPhongMaterial({
            vertexColors: THREE.VertexColors,
            specular: 0
        });
        self.bounds = {};
        self.alignment = {};
        for (var frame in self.brownies.frames) {
            self.bounds[frame] = self.brownies.frames[frame].getBounds();
            self.alignment[frame] = new THREE.Vector3();
        }
        self.scale = 1;
        self.setInternalScale("x", 1);
        self.setInternalAlignment(0, 0, 0);
    }

    self.setInternalAlignment = function(x, y, z) {
        for (var frame in self.brownies.frames) {
            var hx = (self.bounds[frame].max.x - self.bounds[frame].min.x) / 2;
            var hy = (self.bounds[frame].max.y - self.bounds[frame].min.y) / 2;
            var hz = (self.bounds[frame].max.z - self.bounds[frame].min.z) / 2;
            var cx = self.bounds[frame].min.x + hx;
            var cy = self.bounds[frame].min.y + hy;
            var cz = self.bounds[frame].min.z + hz;
            self.alignment[frame].set(-cx, -cy, -cz);
            self.alignment[frame].x += x * hx;
            self.alignment[frame].y += y * hy;
            self.alignment[frame].z += z * hz;
        }
    }

    self.setInternalScale = function(axis, length) {
        if (axis === "x") {
            var l = self.bounds.default.max.x - self.bounds.default.min.x;
            self.scale = length / l;
        } else if (axis === "y") {
            var l = self.bounds.default.max.y - self.bounds.default.min.y;
            self.scale = length / l;
        } else if (axis === "z") {
            var l = self.bounds.default.max.z - self.bounds.default.min.z;
            self.scale = length / l;
        }
    }

    self.getMesh = function(state, tick) {
        var index = Math.floor(tick / self.brownies.states[state].speed) % self.brownies.states[state].frames.length;
        var frame = self.brownies.states[state].frames[index];
        if (!self.meshPool[frame]) {
            self.meshPool[frame] = [];
        }
        var pool = self.meshPool[frame]
        if (pool.length === 0) {
            var container = new THREE.Object3D();
            var mesh = new THREE.Mesh(self.brownies.frames[frame].getGeometry(), self.material);
            container.add(mesh);
            container.release = function() {
                self.meshPool[frame].push(container)
            };
            self.meshPool[frame].push(container);
        }
        var m = self.meshPool[frame].pop();
        m.children[0].scale.set(self.scale, self.scale, self.scale);
        m.children[0].position.set(self.alignment[frame].x * self.scale, self.alignment[frame].y * self.scale, self.alignment[frame].z * self.scale);
        return m;
    }

    self.initialize();
}