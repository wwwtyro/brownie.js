"use strict";

var scene, camera, renderer, light, rock;
var size = 8;
var range = 8;

window.onload = function() {
    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas
    });
    renderer.setClearColor(0x000000);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 32);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    light = new THREE.PointLight(0xffffff, 2, size * range);
    light.position = camera.position.clone();
    scene.add(light);

    var rock = new Brownie(renderer);
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
                if (x == 0 || x == size - 1 || y == 0 || y == size - 1 || z == 0 || z == size - 1) {
                    if (Math.random() < 0.25) {
                        rock.unset(x, y, z);
                    }
                }
            }
        }
    }
    rock.rebuild();
    var geometry = rock.getGeometry();
    var material = new THREE.MeshPhongMaterial({
        vertexColors: THREE.VertexColors,
        specular: 0
    });
    for (var x = -range; x <= range; x++) {
        for (var y = -range; y <= range; y++) {
            var p = new THREE.Mesh(geometry, material);
            p.position.set(-size/2, -size/2, -size/2);
            var m = new THREE.Object3D();
            m.add(p);
            var z = Math.random() < 0.5 ? 1 : 0;
            m.position.set(x * size, y * size, z * size);
            scene.add(m);
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

var tick = 0;
function animate() {
    tick++;
    var r = size * range;
    camera.position.set(r * Math.cos(tick * 0.002), r * Math.sin(tick * 0.002), size * 4)
    camera.lookAt(new THREE.Vector3(0, 0, -size * 4));
    light.position.set(r * Math.cos(tick * 0.002), r * Math.sin(tick * 0.002), size * 2)
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}