"use strict";

var scene, camera, renderer, light, rock, dummy, player;
var size = 8;
var range = 2;

window.onload = function() {
    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas
    });
    renderer.setClearColor(0x000000);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0, 0, 32);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    light = new THREE.PointLight(0xffffff, 2, size * range);
    light.position = camera.position.clone();
    scene.add(light);

    var g = new THREE.IcosahedronGeometry(0.25, 3);
    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    player = new THREE.Mesh(g, m);
    scene.add(player);

    buildRock();

    rock.geom = rock.getGeometry();
    rock.mat = new THREE.MeshPhongMaterial({
        vertexColors: THREE.VertexColors,
        specular: 0
    });

    dummy = new THREE.Object3D();
    scene.add(dummy);

    window.onresize = onResize;

    animate();
}

function buildRock() {
    rock = new Brownie(renderer);
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            for (var z = 0; z < size; z++) {
                var c = Math.random() * 0.5 + 0.5;
                rock.set(x, y, z, c, c * 0.5, c * 0.25);
            }
        }
    }
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            for (var z = 0; z < size; z++) {
                if (x == 0 || x == size - 1 || y == 0 || y == size - 1 || z == 1 || z == size - 1) {
                    if (Math.random() < 0.125) {
                        rock.unset(x, y, z);
                    }
                }
            }
        }
    }
    rock.rebuild();
}

var plots = {};

function getPlot(x, y) {
    if (!plots[[x, y]]) {
        var plot = [];
        if (Math.random() < 0.5) {
            plot.push("rock");
        } else {
            plot.push("wall");
        }
        plots[[x, y]] = plot;
    }
    return plots[[x, y]];
}

var meshpool = [];

function getRockMesh() {
    if (meshpool.length === 0) {
        var p = new THREE.Object3D();
        var m = new THREE.Mesh(rock.geom, rock.mat);
        m.position.set(-size / 2, -size / 2, -size / 2);
        p.add(m);
        meshpool.push(p);
    }
    return meshpool.pop();
}

function releaseRockMesh(m) {
    meshpool.push(m);
}

function getPlotMesh(x, y) {
    var mesh = new THREE.Object3D();
    var plot = getPlot(x, y);
    if (_.contains(plot, "wall")) {
        var m = getRockMesh();
        m.position.set(x * size, y * size, 0);
        mesh.add(m);
    }
    if (_.contains(plot, "rock")) {
        var m = getRockMesh();
        m.position.set(x * size, y * size, size);
        mesh.add(m);
    }
    return mesh;
}

function releasePlotMesh(pm) {
    var children = pm.children.slice();
    for (var i in children) {
        var b = children[i];
        releaseRockMesh(b);
    }
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function keyOn(key) {
    return _.contains(KeyboardJS.activeKeys(), key)
}

function getPlayerPlot() {
    return {
        x: Math.round(camera.position.x / size),
        y: Math.round(camera.position.y / size)
    }
}

function clearScene() {
    var children = dummy.children.slice();
    for (var i in children) {
        var b = children[i];
        dummy.remove(b);
        releasePlotMesh(b);
    }
}

function drawScene() {
    var pp = getPlayerPlot();
    for (var x = pp.x - range; x <= pp.x + range; x++) {
        for (var y = pp.y - range; y <= pp.y + range; y++) {
            var m = getPlotMesh(x, y);
            dummy.add(m);
        }
    }
}

var speed = 0.25;

function updatePlayerPosition() {
    if (keyOn('up') || keyOn('w')) {
        camera.position.y += speed;
    }
    if (keyOn('down') || keyOn('s')) {
        camera.position.y -= speed;
    }
    if (keyOn('left') || keyOn('a')) {
        camera.position.x -= speed;
    }
    if (keyOn('right') || keyOn('d')) {
        camera.position.x += speed;
    }
    player.position.set(camera.position.x, camera.position.y, 8);
}

var tick = 0;

function animate() {
    tick++;
    updatePlayerPosition();
    clearScene();
    drawScene();
    light.position = camera.position.clone();
    light.position.z = 11;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}