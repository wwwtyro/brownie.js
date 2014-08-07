"use strict";

var scene;
var brownie;
var worker;
var editor;
var trackball;
var currentProgramName = "untitled";
var spin = true;

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
        document.getElementById("current-program-name").style.color = "red";
    });
    editor.setFontSize(16);

    scene = new Scene("render-canvas");
    brownie = new Brownie(scene.getRenderer());
    scene.setBrownie(brownie);

    var sceneCanvas = document.getElementById("render-canvas");
    trackball = new Trackball(sceneCanvas, onMouseMove);
    sceneCanvas.addEventListener("wheel", onMouseWheel, false);

    window.addEventListener("resize", reflow, false);

    sceneCanvas.oncontextmenu = function() {
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

    document.getElementById("export-voxels-button").addEventListener("click", onExportVoxels, false);
    document.getElementById("center-button").addEventListener("click", onCenter, false);

    loadExamplesIndex();
    initializeSaves();
    document.getElementById("open-button").addEventListener("click", onOpen, false);
    document.getElementById("save-button").addEventListener("click", onSave, false);
    document.getElementById("modal-saveas-button").addEventListener("click", onModalSaveAs, false);
    document.getElementById("export-voxels-saveas-button").addEventListener("click", onVoxelsExportSaveAs, false);
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
    document.getElementById("current-program-name").style.color = "gray";

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
            scene.setCamera(msg.angle, msg.elevation, msg.radius, msg.x, msg.y, msg.z);
        } else if (msg.command == "clear") {
            brownie.dispose();
            brownie = new Brownie(scene.getRenderer());
            scene.setBrownie(brownie);
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


function onMouseWheel(e) {
    scene.camera.radius *= e.deltaY > 0 ? 1.1 : 0.9;
    scene.camera.radius = Math.max(1, scene.camera.radius);
}


function onMouseMove(e) {
    if (e.button == 0) {
        scene.camera.elevation += e.dy * 0.0025;
        scene.camera.angle += e.dx * 0.0025;
        scene.camera.elevation = Math.max(-0.99 * Math.PI / 2, Math.min(0.99 * Math.PI / 2, scene.camera.elevation));
        return;
    }
    if (e.button == 2) {
        var forward = new THREE.Vector3(Math.cos(scene.camera.angle), 0, Math.sin(scene.camera.angle));
        forward.normalize();
        var right = new THREE.Vector3(Math.cos(scene.camera.angle + Math.PI / 2), 0, Math.sin(scene.camera.angle + Math.PI / 2));
        right.normalize();
        scene.camera.translation.add(right.clone().multiplyScalar(e.dx * 0.001 * scene.camera.radius));
        scene.camera.translation.add(forward.clone().multiplyScalar(-e.dy * 0.001 * scene.camera.radius));
    }
}


function onExportVoxels() {
    var div = document.getElementById("export-modal-body");
    div.innerHTML = brownie.toJSON();
    document.getElementById("export-voxels-filename").value = currentProgramName + ".json";
    $("#export-modal").modal("show");
}

function onVoxelsExportSaveAs() {
    var blob = new Blob([brownie.toJSON()], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, document.getElementById("export-voxels-filename").value);
}

function onCenter() {
    var c = brownie.getCentroid();
    scene.camera.translation.set(c.x, c.y, c.z);
}

function reflow() {
    var menu = document.getElementById("menu");
    var edit = document.getElementById("editor");
    edit.style.top = menu.offsetHeight + "px";
    scene.setSize(window.innerWidth / 2, window.innerHeight);
}

function animate() {
    handleQueue();
    if (spin) {
        scene.camera.angle += 0.01;
    }
    scene.light.position = scene.camera.position.clone();
    scene.render();
    requestAnimationFrame(animate);
}