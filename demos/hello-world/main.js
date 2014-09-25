"use strict";

var scene, mesh, camera, renderer, dummy;

window.onload = function() {

    var aoCanvas = genAOTexture();
    var texture = new THREE.Texture(aoCanvas);
    texture.needsUpdate = true;

    var renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas
    });
    renderer.setClearColor(0x555555);

    scene = new THREE.Scene();

    var size = 7;

    camera = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, size * 30);

    var chunk = new Chunk();
    // for (var i = 0; i < size * size * size/2; i++) {
    //     var x = Math.floor(Math.random() * size);
    //     var y = Math.floor(Math.random() * size);
    //     var z = Math.floor(Math.random() * size);
    //     var r = Math.random();
    //     var g = Math.random();
    //     var b = Math.random();
    //     chunk.set(x, y, z, r, g, b);
    // }
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            chunk.set(x, y, 0, 1, 1, 1);
        }
    }
    chunk.set(2, 3, 1, 1, 1, 1);
    chunk.set(4, 3, 1, 1, 1, 1);
    chunk.set(4, 4, 1, 1, 1, 1);

    var arrays = chunk.genArrays();

    var g = new THREE.BufferGeometry();
    g.addAttribute('position', new THREE.BufferAttribute(arrays.positions, 3));
    g.addAttribute('normal', new THREE.BufferAttribute(arrays.normals, 3));
    g.addAttribute('color', new THREE.BufferAttribute(arrays.colors, 3));
    g.addAttribute('uv', new THREE.BufferAttribute(arrays.uvs, 2));

    var m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        specular: 0,
        shading: THREE.FlatShading,
        vertexColors: THREE.VertexColors
    });
    mesh = new THREE.Mesh(g, m);
    mesh.position.set(-size/2, -size/2, -size/2);

    dummy = new THREE.Object3D();
    dummy.add(mesh);
    scene.add(dummy);

    var light = new THREE.PointLight({
        color: 0xffffff
    });
    light.position.set(0, 0, size * 1);
    scene.add(light);

    animate();
}


function animate() {
    // dummy.rotation.y += 0.01;
    // dummy.rotation.x += 0.013;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}