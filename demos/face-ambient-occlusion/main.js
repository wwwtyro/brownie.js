"use strict";

var scene, mesh, camera, renderer, dummy;

window.onload = function() {

    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas
    });
    renderer.setClearColor(0xaeaeae);

    scene = new THREE.Scene();

    var size = 32;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, size*2);

    var brownie = new Brownie();
    // for (var x = -size; x <= size; x++) {
    //     for (var z = -size; z <= size; z++) {
    //         brownie.set(x, 0, z, 1, 1, 1);
    //     }
    // }
    for (var i = 1; i < size * size * size/8; i++) {
        var x = Math.floor(Math.random() * size);
        var y = Math.floor(Math.random() * size);
        var z = Math.floor(Math.random() * size);
        brownie.set(x, y, z, 1, 1, 1);
    }
    brownie.chunk.calculateAO(100, 10);
    brownie.rebuild();

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: whiteTexture,
        specular: 0,
        vertexColors: THREE.VertexColors
    });

    mesh = new THREE.Mesh(brownie.getGeometry(), m);
    mesh.position.set(-size/2, -size/2, -size/2);

    dummy = new THREE.Object3D();
    dummy.add(mesh);
    scene.add(dummy);

    var light = new THREE.PointLight({
        color: 0xffffff
    });
    light.position.set(0, 0, size*2);
    scene.add(light);

    animate();
}


function animate() {
    dummy.rotation.y += 0.01;
    dummy.rotation.x += 0.015;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}