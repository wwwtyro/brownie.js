(function() {

    "use strict";

    window.aaa = this;

    // Globals.
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    var scene;
    var frames = [];
    var frame = 0;
    var worker;
    var editor;
    var trackball;
    var currentProgramName = "untitled";
    var spin = true;
    var queue = new QueueBug();

    // General.
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    window.onload = function() {
        initializeWorker();
        initializeEditor();
        initializeScene();
        loadExamplesIndex();
        initializeSaves();
        setCurrentProgramName(currentProgramName);
        initializeMenuEvents();
        reflow();
        animate();
        fadeOutCover();
    }

    function initializeMenuEvents() {
        // Program
        document.getElementById("new-button").addEventListener("click", onProgramNewButton, false);
        document.getElementById("open-button").addEventListener("click", onProgramOpenButton, false);
        document.getElementById("save-button").addEventListener("click", onProgramSaveButton, false);
        document.getElementById("modal-save-button").addEventListener("click", onProgramSaveAsModalSaveButton, false);

        // Model
        document.getElementById("clear-button").addEventListener("click", onModelClearButton, false);
        document.getElementById("export-voxels-button").addEventListener("click", onModelExportVoxelsButton, false);

        // View
        document.getElementById("spin-button").addEventListener("click", onViewSpinButton, false);
        document.getElementById("center-button").addEventListener("click", onViewCenterButton, false);
        document.getElementById("export-voxels-saveas-button").addEventListener("click", onModelExportVoxelsSaveButton, false);

        // Menubar
        document.getElementById("run-button").addEventListener("click", onRunButton, false);

        // Frames
        document.getElementById("frame-step-left-button").addEventListener("click", onFrameStepLeftButton, false);
        document.getElementById("frame-step-right-button").addEventListener("click", onFrameStepRightButton, false);

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

    function initializeSaves() {
        if (localStorage.programs === undefined) {
            localStorage.programs = JSON.stringify({});
        }
    }

    function fadeOutCover() {
        setTimeout(function() {
            $("#cover").fadeOut(500);
        }, 0);
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

    // Program
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

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

    // Mouse
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

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

    // Worker
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    function initializeWorker() {
        worker = new Worker("worker.js");
        worker.onmessage = onWorkerMessage;
    }

    function onWorkerMessage(e) {
        var msg = e.data;
        queue.pushMultiple(e.data);
    }

    function handleQueue(max) {
        var brownie = frames[frame];
        max = max ? max : 64;
        var count = 0;
        var rebuild = {};
        while (queue.length() > 0 && count < max) {
            var msg = queue.shift();
            if (msg.command == "set camera") {
                scene.setCamera(msg.angle, msg.elevation, msg.radius, msg.x, msg.y, msg.z);
            } else if (msg.command == "clear") {
                brownie.dispose();
                brownie = new Brownie(scene.getRenderer());
                frames[frame] = brownie;
                scene.setBrownie(brownie);
            } else if (msg.command == "set") {
                brownie.set(msg.x, msg.y, msg.z, msg.r, msg.g, msg.b);
                rebuild[frame] = true;
            } else if (msg.command == "unset") {
                brownie.unset(msg.x, msg.y, msg.z);
                rebuild[frame] = true;
            } else if (msg.command == "add frame") {
                addFrame();
            } else if (msg.command == "set frame") {
                setFrame(msg.n);
                brownie = frames[msg.n];
            }
            count++;
        }
        for (var key in rebuild) {
            frames[key].rebuild();
        }
    }

    // Editor
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    function initializeEditor() {
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
    }

    function loadDefaultExample() {
        $.getJSON("examples/index.json", function(index) {
            $.get(sprintf("examples/%s.js", index.default), function(data) {
                editor.setValue(data, -1);
            }, "text");
        });
    }

    // Scene
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    function initializeScene() {
        scene = new Scene("render-canvas");
        var brownie = new Brownie(scene.getRenderer());
        brownie.rebuild();
        frames[0] = brownie;
        scene.setBrownie(brownie);
        var sceneCanvas = document.getElementById("render-canvas");
        trackball = new Trackball(sceneCanvas, onMouseMove);
        sceneCanvas.addEventListener("wheel", onMouseWheel, false);
        window.addEventListener("resize", reflow, false);
        sceneCanvas.oncontextmenu = function() {
            return false
        };
    }

    // Frames
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    function addFrame() {
        var brownie = new Brownie(scene.getRenderer());
        brownie.rebuild();
        frames.push(brownie);
    }

    function setFrame(n) {
        frame = n;
        scene.setBrownie(frames[n]);
        document.getElementById("frame-number").innerHTML = sprintf("Frame %d/%d", frame + 1, frames.length);
    }

    // Menu/UI
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    // Program 

    function onProgramNewButton() {
        setCurrentProgramName("untitled");
        editor.setValue("", -1);
    }

    function onProgramSaveButton() {
        if (currentProgramName == "untitled") {
            $("#saveas-modal").modal("show");
            return;
        }
        saveProgram(currentProgramName, editor.getSession().getValue());
    }

    function onProgramSaveAsModalSaveButton() {
        var programName = document.getElementById("saveas-program-name").value;
        saveProgram(programName, editor.getSession().getValue());
        setCurrentProgramName(programName);
        document.getElementById("saveas-program-name").value = "";
    }

    function onProgramOpenButton() {
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

    // Model 

    function onModelClearButton() {
        worker.postMessage({
            command: "clear"
        });
    }

    function onModelExportVoxelsButton() {
        var div = document.getElementById("export-modal-body");
        div.innerHTML = frames[frame].toJSON();
        document.getElementById("export-voxels-filename").value = currentProgramName + ".json";
        $("#export-modal").modal("show");
    }

    function onModelExportVoxelsSaveButton() {
        var blob = new Blob([frames[frame].toJSON()], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, document.getElementById("export-voxels-filename").value);
    }

    // View 

    function onViewSpinButton() {
        spin = !spin;
    }

    function onViewCenterButton() {
        var c = frames[frame].getCentroid();
        scene.camera.translation.set(c.x, c.y, c.z);
    }

    // Run 

    function onRunButton() {
        worker.postMessage({
            command: "run",
            program: editor.getSession().getValue()
        });
    }

    // Frames

    function onFrameStepLeftButton() {
        var targetFrame = frame - 1;
        if (targetFrame < 0) {
            targetFrame = frames.length - 1;
        }
        setFrame(targetFrame);
    }

    function onFrameStepRightButton() {
        var targetFrame = frame + 1;
        if (targetFrame >= frames.length) {
            targetFrame = 0;
        }
        setFrame(targetFrame);
    }

})();