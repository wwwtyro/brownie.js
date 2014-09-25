
var size = 64;
var aoFactor = 64.0;

function genAOTexture() {
    var templates = [];

    function genAOTemplate(dfunc) {
        var canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        var ctx = canvas.getContext('2d');
        for (var x = 0; x < size; x++) {
            var nx = x / size;
            for (var y = 0; y < size; y++) {
                var ny = y / size;
                var ao = 0;
                var mind = 1000.0;
                for (var r = 0; r < size; r++) {
                    var nr = r / size;
                    var dxy = dfunc(nx, ny, nr);
                    var dx = dxy[0];
                    var dy = dxy[1];
                    var d = Math.sqrt(dx*dx + dy*dy);
                    // mind = Math.min(d, mind);
                    var c = Math.exp(-d);
                    ao += c*c*c*c / size;
                }
                // ao = Math.exp(-mind)
                ao = aoFactor * (ao / 12);
                ctx.fillStyle = "rgba(0, 0, 0, " + ao + ")";
                ctx.fillRect(x, y, 1, 1);
            }
        }    
        return canvas;
    }

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx,
            ny - (1 + nr)
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - nr,
            ny - 1
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - 1,
            ny - (1 + nr)
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - (1 + nr),
            ny - 1
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - 1,
            ny - nr
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - (1 + nr),
            ny
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - 1,
            ny + nr
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx - nr,
            ny
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx,
            ny + nr
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx + nr,
            ny
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx,
            ny - nr
        ];
    }));

    templates.push(genAOTemplate(function(nx, ny, nr){
        return [
            nx + nr,
            ny - 1
        ];
    }));

    var canvas = document.createElement("canvas");
    canvas.width = size*256;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, size * 256, size);
    for (var i = 0; i < 256; i++) {
        var ao0 = (1 & i) / 1;
        var ao1 = (2 & i) / 2;
        var ao2 = (4 & i) / 4;
        var ao3 = (8 & i) / 8;
        var ao4 = (16 & i) / 16;
        var ao5 = (32 & i) / 32;
        var ao6 = (64 & i) / 64;
        var ao7 = (128 & i) / 128;
        var x = i * size;
        if (ao0 && !ao1) {
            ctx.drawImage(templates[0], x, 0);
        }
        if (ao1) {
            ctx.drawImage(templates[1], x, 0);
        }
        if (ao2 && !ao1) {
            ctx.drawImage(templates[2], x, 0);
        }
        if (ao2 && !ao3) {
            ctx.drawImage(templates[3], x, 0);
        }
        if (ao3) {
            ctx.drawImage(templates[4], x, 0);
        }
        if (ao4 && !ao3) {
            ctx.drawImage(templates[5], x, 0);
        }
        if (ao4 && !ao5) {
            ctx.drawImage(templates[6], x, 0);
        }
        if (ao5) {
            ctx.drawImage(templates[7], x, 0);
        }
        if (ao6 && !ao5) {
            ctx.drawImage(templates[8], x, 0);
        }
        if (ao6 && !ao7) {
            ctx.drawImage(templates[9], x, 0);
        }
        if (ao7) {
            ctx.drawImage(templates[10], x, 0);
        }
        if (ao0 && !ao7) {
            ctx.drawImage(templates[11], x, 0);
        }


    }
    return canvas;
 }