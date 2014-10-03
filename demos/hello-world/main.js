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

    var size = 3;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, size*1.25);

    var brownie = new Brownie();
    brownie.set(0,1,1, 0, 0.5, 1);
    brownie.set(2,1,1, 0, 0.5, 1);
    brownie.set(1,0,1, 0, 0.5, 1);
    brownie.set(1,2,1, 0, 0.5, 1);
    brownie.set(1,1,0, 0, 0.5, 1);
    brownie.set(1,1,2, 0, 0.5, 1);
    brownie.set(0,0,0, 0, 0.5, 1);
    brownie.set(0,2,0, 0, 0.5, 1);
    brownie.set(0,0,2, 0, 0.5, 1);
    brownie.set(0,2,2, 0, 0.5, 1);
    brownie.set(2,0,0, 0, 0.5, 1);
    brownie.set(2,2,0, 0, 0.5, 1);
    brownie.set(2,0,2, 0, 0.5, 1);
    brownie.set(2,2,2, 0, 0.5, 1);
    brownie.rebuild();

    var m = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: ambientOcclusionTexture,
        // specular: 0,
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
    light.position.set(size, size, size*2);
    scene.add(light);

    animate();
}


function animate() {
    dummy.rotation.y += 0.01;
    dummy.rotation.x += 0.011;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}