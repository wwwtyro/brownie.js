"use strict";


var scene, mesh, camera, renderer, renderCanvas;
var light, brownie;
var worker;
var editor;
var trackball;
var currentProgramName = "untitled";
var spin = true;

function QueueBug() {
    // Because https://code.google.com/p/chromium/issues/detail?id=393569
    var self = this;
    self.initialize = function() {
        self.index = 0;
        self.queue = [];
        self.chunkSize = 1000;
    }
    self.push = function(item) {
        self.queue.push(item);
    }
    self.pushMultiple = function(items) {
        self.queue.push.apply(self.queue, items);
    }
    self.shift = function() {
        var item = undefined;
        if (self.index < self.queue.length) {
            item = self.queue[self.index];
        }
        self.index++;
        if (self.index >= self.chunkSize || self.index >= self.queue.length) {
            self.queue = self.queue.slice(self.index, self.queue.length);
            self.index = 0;
        }
        return item;
    }
    self.length = function() {
        return self.queue.length;
    }
    self.initialize();
}


var queue = new QueueBug();

window.onload = function() {

    worker = new Worker("worker.js");
    worker.onmessage = onMessage;

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");
    if (localStorage["last edited"] === undefined) {
        loadDefaultExample();
        setTimeout(function() {
            worker.postMessage({
                command: "run",
                program: editor.getSession().getValue()
            });
        }, 1000);
    } else {
        editor.setValue(localStorage["last edited"], -1);
    }
    editor.on("change", function() {
        localStorage["last edited"] = editor.getValue();
    });
    editor.setFontSize(16);

    renderCanvas = document.getElementById("render-canvas");
    renderCanvas.width = window.innerWidth / 2;
    renderCanvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas
    });
    renderer.setClearColor(0x555555);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);
    camera.elevation = Math.PI / 4;
    camera.radius = 10.0;
    camera.angle = 0.0;
    camera.translation = new THREE.Vector3(0, 0, 0);

    brownie = new Brownie(renderer);
    var m = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        vertexColors: THREE.VertexColors,
        specular: 0
    });
    mesh = new THREE.Mesh(brownie.getGeometry(), m);
    scene.add(mesh);

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
    var p = new THREE.Mesh(g, m);
    p.rotation.x = -Math.PI / 2;
    p.scale.set(2000, 2000, 1);
    p.position.y = -0.02;
    scene.add(p);

    light = new THREE.PointLight({
        color: 0xffffff
    });
    light.position.set(10, 10, 20);
    scene.add(light);

    trackball = new Trackball(renderCanvas, onMouseMove);
    renderCanvas.addEventListener("wheel", onMouseWheel, false);

    window.addEventListener("resize", reflow, false);

    renderCanvas.oncontextmenu = function() {
        return false
    };

    document.getElementById("run-button").addEventListener("click", function() {
        worker.postMessage({
            command: "run",
            program: editor.getSession().getValue()
        });
    }, false);

    document.getElementById("clear-button").addEventListener("click", function() {
        worker.postMessage({
            command: "clear"
        });
    }, false);

    document.getElementById("spin-button").addEventListener("click", function() {
        spin = !spin;
    }, false);

    document.getElementById("new-button").addEventListener("click", function() {
        setCurrentProgramName("untitled");
        editor.setValue("", -1);  
    }, false);

    document.getElementById("export-button").addEventListener("click", onExport, false);
    document.getElementById("center-button").addEventListener("click", onCenter, false);

    loadExamplesIndex();
    initializeSaves();
    document.getElementById("open-button").addEventListener("click", onOpen, false);
    document.getElementById("save-button").addEventListener("click", onSave, false);
    document.getElementById("modal-saveas-button").addEventListener("click", onModalSaveAs, false);
    setCurrentProgramName(currentProgramName);

    reflow();
    $("#cover").fadeOut(500);
    animate();
}

function onSave() {
    if (currentProgramName == "untitled") {
        $("#saveas-modal").modal("show");
        return;
    }
    saveProgram(currentProgramName, editor.getSession().getValue());
}

function onModalSaveAs() {
    var programName = document.getElementById("saveas-program-name").value;
    saveProgram(programName, editor.getSession().getValue());
    setCurrentProgramName(programName);
    document.getElementById("saveas-program-name").value = "";
}

function initializeSaves() {
    if (localStorage.programs === undefined) {
        localStorage.programs = JSON.stringify({});
    }
}

function saveProgram(programName, programText) {
    var programs = getPrograms();
    programs[programName] = programText;
    setPrograms(programs);
}

function openProgram(programName) {
    editor.setValue(getPrograms()[programName], -1);
}

function getPrograms() {
    return JSON.parse(localStorage.programs);
}

function setPrograms(programs) {
    localStorage.programs = JSON.stringify(programs);
}

function setCurrentProgramName(programName) {
    currentProgramName = programName;
    document.getElementById("current-program-name").innerHTML = programName;
}

function loadExamplesIndex() {
    $.getJSON("examples/index.json", function(index) {
        var div = document.getElementById("examples-modal-body");
        var content = "";
        for (var i in index.examples) {
            var example = index.examples[i];
            content += sprintf("<span id='example-select-%s' class='pseudolink'>%s</span><br>", example, example);
        }
        div.innerHTML = content;
        for (var i in index.examples) {
            var example = index.examples[i];
            (function(e) {
                // Dont do this - these eventlisteners might hang around. Should just have a list of names and an open button.
                document.getElementById(sprintf("example-select-%s", e)).addEventListener("click", function() {
                    $.get(sprintf("examples/%s.js", e), function(data) {
                        editor.setValue(data, -1);
                        setCurrentProgramName("untitled");
                        $("#examples-modal").modal("hide");
                    }, "text");
                }, false);
            })(example);
        }
    });
}

function onOpen() {
    var programs = getPrograms();
    var div = document.getElementById("open-modal-body");
    var content = "";
    for (var programName in programs) {
        content += sprintf("<span id='open-select-%s' class='pseudolink'>%s</span><br>", programName, programName);
    }
    div.innerHTML = content;
    for (var programName in programs) {
        (function(n) {
            // Dont do this - these eventlisteners might hang around. Should just have a list of names and an open button.
            document.getElementById(sprintf("open-select-%s", n)).addEventListener("click", function() {
                openProgram(n);
                setCurrentProgramName(n);
                $("#open-modal").modal("hide");
            });
        })(programName);
    }
    $("#open-modal").modal("show");
}

function loadDefaultExample() {
    $.getJSON("examples/index.json", function(index) {
        $.get(sprintf("examples/%s.js", index.default), function(data) {
            editor.setValue(data, -1);
        }, "text");
    });
}

function onMessage(e) {
    var msg = e.data;
    queue.pushMultiple(e.data);
}

function handleQueue(max) {
    max = max ? max : 64;
    var count = 0;
    var rebuild = false;
    while (queue.length() > 0 && count < max) {
        var msg = queue.shift();
        if (msg.command == "set camera") {
            camera.angle = msg.angle;
            camera.elevation = msg.elevation;
            camera.radius = msg.radius;
            camera.translation.set(msg.x, msg.y, msg.z);
        } else if (msg.command == "clear") {
            brownie.dispose();
            scene.remove(mesh);
            brownie = new Brownie(renderer);
            var m = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                vertexColors: THREE.VertexColors,
                specular: 0
            });
            mesh = new THREE.Mesh(brownie.getGeometry(), m);
            scene.add(mesh);
        } else if (msg.command == "set") {
            brownie.set(msg.x, msg.y, msg.z, msg.r, msg.g, msg.b);
            rebuild = true;
        } else if (msg.command == "unset") {
            brownie.unset(msg.x, msg.y, msg.z);
            rebuild = true;
        }
        count++;
    }
    if (rebuild) {
        brownie.rebuild();
    }
}

function updateCamera() {
    camera.position.x = camera.radius * Math.cos(camera.angle) * Math.cos(camera.elevation);
    camera.position.y = camera.radius * Math.sin(camera.elevation);
    camera.position.z = camera.radius * Math.sin(camera.angle) * Math.cos(camera.elevation);
    var forward = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize();
    var right = new THREE.Vector3(Math.cos(camera.angle + Math.PI / 2), 0, Math.sin(camera.angle + Math.PI / 2));
    camera.up = forward.clone().cross(right).normalize();
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.position.add(camera.translation);
}

function onMouseWheel(e) {
    camera.radius *= e.deltaY > 0 ? 1.1 : 0.9;
    camera.radius = Math.max(1, camera.radius);
}


function onMouseMove(e) {
    if (e.button == 0) {
        camera.elevation += e.dy * 0.0025;
        camera.angle += e.dx * 0.0025;
        camera.elevation = Math.max(-0.99 * Math.PI / 2, Math.min(0.99 * Math.PI / 2, camera.elevation));
        return;
    }
    if (e.button == 2) {
        var forward = new THREE.Vector3(Math.cos(camera.angle), 0, Math.sin(camera.angle));
        forward.normalize();
        var right = new THREE.Vector3(Math.cos(camera.angle + Math.PI / 2), 0, Math.sin(camera.angle + Math.PI / 2));
        right.normalize();
        camera.translation.add(right.clone().multiplyScalar(e.dx * 0.001 * camera.radius));
        camera.translation.add(forward.clone().multiplyScalar(-e.dy * 0.001 * camera.radius));
    }
}


function onExport() {
    var div = document.getElementById("export-modal-body");
    div.innerHTML = brownie.toJSON();
    $("#export-modal").modal("show");
}

function onCenter() {
    var c = brownie.getCentroid();
    camera.translation.set(c.x, c.y, c.z);
}

function reflow() {
    var menu = document.getElementById("menu");
    var edit = document.getElementById("editor");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    edit.style.top = menu.offsetHeight + "px";
    renderer.setSize(window.innerWidth / 2, window.innerHeight);
    camera.aspect = (window.innerWidth / 2) / window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    handleQueue();
    if (spin) {
        camera.angle += 0.01;
    }
    updateCamera();
    light.position = camera.position.clone();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}