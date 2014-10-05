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

    var size = 16; //Must be multiple of two.

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 100);
    camera.position.set(0, 0, size*2);

    var brownie = new Brownie();
    for (var x = -size/2; x <= size + size/2; x++) {
        for (var z = -size/2; z <= size + size/2; z++) {
            var c = 1.0;//Math.random() * 0.1 + 0.9;
            brownie.set(x, 0, z, c, c, c);
        }
    }
    for (var i = 1; i < size * size * size/8; i++) {
        var x = Math.floor(Math.random() * size);
        var y = Math.floor(Math.random() * size) + 1;
        var z = Math.floor(Math.random() * size);
        brownie.set(x, y, z, 0, 0.5, 1);
    }
    var t0 = performance.now();
    brownie.chunk.calculateAO(100, 32);
    console.log(performance.now() - t0);
    brownie.rebuild();

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        // map: whiteTexture,
        map: ambientOcclusionTexture,
        specular: 0,
        vertexColors: THREE.VertexColors
    });

    dummy = new THREE.Object3D();
    scene.add(dummy);

    mesh = new THREE.Mesh(brownie.getGeometry(), m);
    mesh.position.set(-size/2, -size/2, -size/2);
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
    dummy.rotation.y += 0.01;
    dummy.rotation.x = 0.5;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}