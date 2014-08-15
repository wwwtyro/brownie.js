/*

    Todo:
        
        Disable relevant ui functionality when worker is running, e.g., 
        disallow frame-changing.
        
        Provide a quiet run button that doesn't do any rendering until
        the worker is finished. For efficient brownie construction.
        
        Add a function that allows the worker program to indicate how far
        along execution is, and use that to fill out a progress bar.

        Fix the issue with callbacks in loadExamplesIndex and onProgramOpenButton.

        Store the state of the editor better - save state, program name, etc.

*/

(function() {

    "use strict";

    // Globals.
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    var scene, sceneCanvas, fps;
    var frames = [],
        frame = 0;
    var worker;
    var editor;
    var currentProgramName = "untitled";
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
        document.getElementById("export-voxels-saveas-button").addEventListener("click", onModelExportVoxelsSaveButton, false);

        // View
        document.getElementById("center-button").addEventListener("click", onViewCenterButton, false);
        document.getElementById("view-get-camera-button").addEventListener("click", onViewGetCameraButton, false);

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
        handleKeys();
        updatePoint();
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

    function initializeSaves() {
        if (localStorage.programs === undefined) {
            localStorage.programs = JSON.stringify({});
        }
    }

    // Mouse
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    function onMouseDown(e) {
        console.log(getSelectedVoxel());
        PointerLock.requestFor(sceneCanvas);
    }

    function onMouseWheel(e) {}

    function onMouseMove(e) {
        if (isPointerLocked()) {
            var dx = e.webkitMovementX || e.mozMovementX || e.movementX || 0;
            var dy = e.webkitMovementY || e.mozMovementY || e.movementY || 0;
            fps.pitch -= dy * 0.001;
            fps.yaw += dx * 0.001;
            updateCamera();
        }
    }

    // Keyboard
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

    function keyDown(key) {
        return KeyboardJS.activeKeys().indexOf(key) >= 0 ? true : false;
    }


    function handleKeys() {
        if (isPointerLocked()) {
            var camSpeed = 0.1;
            if (keyDown('shift')) {
                camSpeed *= 10;
            }
            if (keyDown('w')) {
                scene.camera.position.add(fps.front.clone().multiplyScalar(camSpeed));
            }
            if (keyDown('s')) {
                scene.camera.position.add(fps.front.clone().multiplyScalar(-camSpeed));
            }
            if (keyDown('d')) {
                scene.camera.position.add(fps.right.clone().multiplyScalar(camSpeed));
            }
            if (keyDown('a')) {
                scene.camera.position.add(fps.right.clone().multiplyScalar(-camSpeed));
            }
            if (keyDown('e')) {
                scene.camera.position.add(new THREE.Vector3(0, 1, 0).multiplyScalar(camSpeed));
            }
            if (keyDown('q')) {
                scene.camera.position.add(new THREE.Vector3(0, 1, 0).multiplyScalar(-camSpeed));
            }
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
                scene.camera.position.set(msg.x, msg.y, msg.z);
                fps.pitch = msg.pitch;
                fps.yaw = msg.yaw;
                updateCamera();
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
        scene.camera.position.set(0, 4, 4);
        var brownie = new Brownie(scene.getRenderer());
        brownie.rebuild();
        frames[0] = brownie;
        scene.setBrownie(brownie);
        sceneCanvas = document.getElementById("render-canvas");
        sceneCanvas.addEventListener("mousedown", onMouseDown, false);
        window.addEventListener("mousemove", onMouseMove, false);
        window.addEventListener("resize", reflow, false);
        fps = {
            pitch: -Math.PI / 4,
            yaw: -Math.PI / 2,
            front: new THREE.Vector3(),
            right: new THREE.Vector3()
        };
        updateCamera();
        sceneCanvas.oncontextmenu = function() {
            return false
        };
    }

    function isPointerLocked() {
        return PointerLock.element() === sceneCanvas;
    }

    function updateCamera() {
        fps.pitch = Math.max(0.999 * -Math.PI / 2, Math.min(0.999 * Math.PI / 2, fps.pitch));
        fps.front.set(
            Math.cos(fps.pitch) * Math.cos(fps.yaw),
            Math.sin(fps.pitch),
            Math.cos(fps.pitch) * Math.sin(fps.yaw));
        var up = new THREE.Vector3(0, 1, 0);
        fps.right = fps.front.clone().cross(up);
        scene.camera.lookAt(scene.camera.position.clone().add(fps.front));
    }

    function getSelectedVoxel() {
        var rayList = castRay(scene.camera.position.clone(), fps.front.clone(), 128);
        var voxels = rayList.voxels;
        var points = rayList.points;
        for (var i = 0; i < voxels.length; i++) {
            var v = voxels[i];
            if (frames[frame].get(v[0], v[1], v[2]) || v[1] < 0) {
                return {
                    voxel: voxels[i],
                    point: points[i]
                };
            }
        }
        return undefined;
    }

    function updatePoint() {
        scene.scene.remove(scene.point);
        var b = getSelectedVoxel();
        if (b) {
            scene.point.position.set(b.point[0], b.point[1], b.point[2]);
            scene.scene.add(scene.point);
        }
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

    function framesToJSON() {
        var json = [];
        for (var i = 0; i < frames.length; i++) {
            json.push(frames[i].toJSON());
        }
        return JSON.stringify(json);
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
        div.innerHTML = framesToJSON();
        document.getElementById("export-voxels-filename").value = currentProgramName + ".json";
        $("#export-modal").modal("show");
    }

    function onModelExportVoxelsSaveButton() {
        var blob = new Blob([framesToJSON()], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, document.getElementById("export-voxels-filename").value);
    }

    // View 

    function onViewCenterButton() {
        var c = frames[frame].getCentroid();
        var b = frames[frame].getBounds();
        var z = Math.max(b.max.x - c.x, c.x - b.min.x) / Math.tan(75);
        scene.camera.position.set(c.x, c.y, c.z - z);
        fps.pitch = 0;
        fps.yaw = -Math.PI / 2;
        updateCamera();
    }

    function onViewGetCameraButton() {
        var div = document.getElementById("get-camera-modal-body");
        div.innerHTML = sprintf("setCamera(%.3f, %.3f, %.3f, %.3f, %.3f);",
            scene.camera.position.x, scene.camera.position.y, scene.camera.position.z, fps.yaw, fps.pitch);
        $("#get-camera-modal").modal("show");
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