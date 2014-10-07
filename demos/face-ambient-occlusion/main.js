"use strict";

var scene, mesh, camera, renderer, dummy;

window.onload = function() {

    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas,
        antialias: true
    });
    renderer.setClearColor(0xaeaeae);

    scene = new THREE.Scene();

    var size = 32; //Must be multiple of two.

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 100);
    camera.position.set(0, 0, size*2);

    var brownie = new Brownie();

    for (var x = -size/2; x < size + size/2; x++) {
        for (var z = -size/2; z < size + size/2; z++) {
            brownie.set(x, -1, z, 1, 1, 1);
        }
    }

    for (var i = 0; i < size; i++) {
        var x = Math.floor(Math.random() * size);
        var z = Math.floor(Math.random() * size);
        var r = Math.random() * 0.5 + 0.5;
        var g = Math.random() * 0.5 + 0.5;
        var b = Math.random() * 0.5 + 0.5;
        for (var y = 0; y < size; y++) {
            brownie.set(x, y, z, r, g, b);
        }
        var y = Math.floor(Math.random() * size);
        var z = Math.floor(Math.random() * size);
        var r = Math.random() * 0.5 + 0.5;
        var g = Math.random() * 0.5 + 0.5;
        var b = Math.random() * 0.5 + 0.5;
        for (var x = 0; x < size; x++) {
            brownie.set(x, y, z, r, g, b);
        }
        var y = Math.floor(Math.random() * size);
        var x = Math.floor(Math.random() * size);
        var r = Math.random() * 0.5 + 0.5;
        var g = Math.random() * 0.5 + 0.5;
        var b = Math.random() * 0.5 + 0.5;
        for (var z = 0; z < size; z++) {
            brownie.set(x, y, z, r, g, b);
        }
    }

    var t0 = performance.now();
    brownie.chunk.calculateAO(100, size);
    console.log("AO:", performance.now() - t0);

    var t0 = performance.now();
    for (var i = 0; i < 2; i++) {
        brownie.chunk.antialiasAO();
    }
    console.log("AO AA:", performance.now() - t0);
    
    brownie.rebuild();

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: whiteTexture,
        // map: ambientOcclusionTexture,
        specular: 0,
        vertexColors: THREE.VertexColors
    });

    dummy = new THREE.Object3D();
    scene.add(dummy);

    mesh = new THREE.Mesh(brownie.getGeometry(), m);
    mesh.position.set(-size/2, 0, -size/2);
    dummy.add(mesh);

    // mesh = new THREE.Mesh(brownie.getGeometry(), m);
    // mesh.position.set(size + size/2 + 1, -size/2, -size/2);
    // dummy.add(mesh);

    var light = new THREE.PointLight({
        color: 0xffffff
    });
    light.position.set(size*2, size*2, size*4);
    scene.add(light);

    animate();
}


function animate() {
    dummy.rotation.y = 0.5;
    dummy.rotation.x = 0.75;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}