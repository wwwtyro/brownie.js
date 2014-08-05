"use strict";

var scene, dummy, camera, renderer, light, player;
var brownieManager, field;

var BrownieManager = function(renderer) {

    var self = this;

    self.initialize = function() {
        self.renderer = renderer;
        self.brownies = {};
        self.brownieMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
            specular: 0
        });
    };

    self.loadBrownie = function(url) {
        self.brownies[url] = {
            brownie: new Brownie(renderer),
            pool: [],
            loaded: false
        };
        $.getJSON(url, function(json) {
            self.getBrownie(url).fromJSON(json);
            self.getBrownie(url).rebuild();
            self.brownies[url].loaded = true;
        });
    };

    self.allLoaded = function() {
        for (var url in self.brownies) {
            if (self.brownies[url].loaded == false) {
                return false;
            }
        }
        return true;
    };

    self.getBrownie = function(url) {
        return self.brownies[url].brownie;
    };

    self.getMesh = function(url) {
        if (self.brownies[url].pool.length == 0) {
            var mesh = new THREE.Mesh(self.getBrownie(url).getGeometry(), self.brownieMaterial);
            mesh.brownieURL = url;
            return mesh;
        } else {
            return self.brownies[url].pool.pop();
        }
    };

    self.releaseMesh = function(mesh) {
        self.brownies[mesh.brownieURL].pool.push(mesh);
    };

    self.initialize();

}

window.onload = function() {
    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas
    });
    renderer.setClearColor(0x000000);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 96, -64);
    camera.lookAt(new THREE.Vector3(0, 32, 0));

    dummy = new THREE.Object3D();
    scene.add(dummy);

    var g = new THREE.IcosahedronGeometry(0.5, 3);
    var m = new THREE.MeshBasicMaterial({
        color: 0x00ffff
    });
    player = new THREE.Mesh(g, m);
    player.position.set(0, 16, 0);
    scene.add(player);

    player.v = new THREE.Vector3();

    light = new THREE.PointLight(0xffffff, 1, 8 * 16);
    player.add(light);

    brownieManager = new BrownieManager(renderer);

    brownieManager.loadBrownie("tree-0.json");
    brownieManager.loadBrownie("tree-1.json");
    brownieManager.loadBrownie("tree-2.json");
    brownieManager.loadBrownie("tree-3.json");
    brownieManager.loadBrownie("grass-0.json");
    brownieManager.loadBrownie("grass-1.json");
    brownieManager.loadBrownie("grass-2.json");
    brownieManager.loadBrownie("column-0.json");
    brownieManager.loadBrownie("column-1.json");
    brownieManager.loadBrownie("shrooms-0.json");

    field = {};

    window.onresize = onResize;

    animate();
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function randomChoice(a) {
    var r = Math.floor(Math.random() * a.length);
    return a[r];
}

function getPlot(x, z) {
    if (field[[x, z]] == undefined) {
        var brownies = [];
        brownies.push({
            url: randomChoice(["grass-0.json", "grass-1.json", "grass-2.json"]),
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
        });
        if (Math.random() < 0.1) {
            var scale = Math.random() * 0.5 + 0.5;
            brownies.push({
                url: randomChoice(["tree-0.json", "tree-1.json", "tree-2.json", "tree-3.json"]),
                rotation: {
                    x: 0,
                    y: Math.random() * Math.PI * 2,
                    z: 0
                },
                scale: {
                    x: scale,
                    y: scale,
                    z: scale
                }
            });
        } else if (Math.random() < 0.01) {
            brownies.push({
                url: randomChoice(["column-0.json", "column-1.json"]),
                rotation: {
                    x: 0,
                    y: Math.random() * Math.PI * 2,
                    z: 0
                },
                scale: {
                    x: 0.75,
                    y: 0.75,
                    z: 0.75
                }
            });
        } else if (Math.random() < 0.001) {
            brownies.push({
                url: randomChoice(["shrooms-0.json"]),
                rotation: {
                    x: 0,
                    y: Math.random() * Math.PI * 2,
                    z: 0
                },
                scale: {
                    x: 0.25,
                    y: 0.25,
                    z: 0.25
                }
            });
        }
        field[[x, z]] = brownies;
    }
    return field[[x, z]];
}

function getPlayerBlock() {
    return {
        x: Math.floor(player.position.x / 16),
        z: Math.floor((player.position.z + 64) / 16)
    };
}

function clearScene() {
    var children = dummy.children.slice();
    for (var i in children) {
        var child = children[i];
        dummy.remove(child);
        brownieManager.releaseMesh(child);
    }
}

var range = 11;

function drawScene() {
    var pb = getPlayerBlock();
    for (var x = pb.x - range; x < pb.x + range; x++) {
        for (var z = pb.z - range; z < pb.z + range; z++) {
            var plots = getPlot(x, z);
            for (var i in plots) {
                var plot = plots[i];
                var m = brownieManager.getMesh(plot.url);
                m.position.set(x * 16, 0, z * 16);
                m.rotation.set(plot.rotation.x, plot.rotation.y, plot.rotation.z);
                if (plot.scale) {
                    m.scale.set(plot.scale.x, plot.scale.y, plot.scale.z);
                }
                dummy.add(m);
            }
        }
    }
}

function keyOn(key) {
    return _.contains(KeyboardJS.activeKeys(), key)
}

var speed = 0.1;

function updatePlayerPosition() {
    if (keyOn('up') || keyOn('w')) {
        player.v.z -= speed;
    }
    if (keyOn('down') || keyOn('s')) {
        player.v.z += speed;
    }
    if (keyOn('left') || keyOn('a')) {
        player.v.x -= speed;
    }
    if (keyOn('right') || keyOn('d')) {
        player.v.x += speed;
    }
    player.position.y = Math.sin(tick * 0.1) * 1 + 16;
    player.position.add(player.v)
    player.v.multiplyScalar(0.9);
    if (player.v.length() > 0.001) {
        document.getElementById("help").style.visibility = "hidden";
    } else {
        document.getElementById("help").style.visibility = "visible";
    }
}

function updateHelp() {
    var help = document.getElementById("help");
    if (brownieManager.allLoaded()) {
        help.innerHTML = "Use WASD or arrow keys to move.";
    } else {
        help.innerHTML = "Loading...";
    }
    
}

var tick = 0;

function animate() {
    tick++;
    updateHelp();
    updatePlayerPosition();
    var targetPos = player.position.clone();
    targetPos.y = 16;
    camera.position.add(targetPos.clone().add(new THREE.Vector3(0, 96, 64)).sub(camera.position.clone()).multiplyScalar(0.1));
    camera.lookAt(camera.position.clone().add(new THREE.Vector3(0, -96, -64)));
    clearScene();
    drawScene();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}