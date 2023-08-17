var physicsObjects = []; // 1D array of physics objects
var renderedObjects = []; // 2D array of render layers (0 is background)
var actionObjects = []; // list of action scripts to run

function startGame() {
    // Add flexible fps from input bar
    document.getElementById("fpsSlider").oninput = function () {
        document.getElementById('fpsDisplay').innerHTML = this.value + ' fps';
        updateFPS(this.value);
    }
    scene.start();
    for (i = 0; i < actionObjects.length; i++) {
        actionObjects[i].startaction();
    }
}
function updateFPS(value) {
    if (myGameArea.interval2) {
        clearInterval(myGameArea.interval2);
        myGameArea.interval2 = setInterval(updateRender, 1000/value);
    }
}
function update() { // physics update (NOT FRAME RENDERING)
    scene.frameNo++;
    // Do any everyinterval logic here

    // Update physics
    for (i = 0; i < physicsObjects.length; i++) {
        physicsObjects[i].update();
    }
    for (i = 0; i < actionObjects.length; i++) {
        actionObjects[i].updatefixedaction();
    }
}
function render() { // frame update
    scene.clear();
    for (i = 0; i < renderedObjects.length; i++) {
        for (j = 0; j < renderedObjects[i].length; j++) {
            renderedObjects[i][j].render();
        }
    }
    for (i = 0; i < actionObjects.length; i++) {
        actionObjects[i].updateaction();
    }
    scene.keysdown = [];
}
function camera(x, y, zoom) {
    this.x = x;
    this.y = y;
    this.zoom = zoom; // zoom should be at least 1, or objects might not appear to move smoothly
}
// Active scene
var scene = {
    canvas : document.createElement("canvas"),
    start : function() {
        // Create and insert canvas
        this.width = innerWidth;
        this.height = innerWidth * (9/16);
        this.camera = new camera(this.width/2, this.height/2, 1);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // Set framerate and physics intervals
        this.frameNo = 0;
        this.physicsInterval = setInterval(update, 1000/60);
        this.renderInterval = setInterval(render, 1000/60);

        // Add listeners for mouse and keyboard
        window.addEventListener('mousedown', function (e) {
            scene.mouseDown = true;
            scene.mousex = e.pageX;
            scene.mousey = e.pageY;
        })
        window.addEventListener('mousemove', function (e) {
            if (scene.mouseDown) {
                scene.mousex = e.pageX;
                scene.mousey = e.pageY;
            }
        })
        window.addEventListener('mouseup', function (e) {
            scene.mouseDown = false;
        })
        window.addEventListener('keydown', function (e) {
            scene.keys = (scene.keys || []);
            scene.keys[e.key.toUpperCase()] = true;
            
            scene.keysdown = (scene.keys || []);
            scene.keysdown[e.key.toUpperCase()] = true;
        })
        window.addEventListener('keyup', function (e) {
            scene.keys[e.key.toUpperCase()] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    pause : function() {
        clearInterval(this.physicsInterval);
    },
    resume : function() {
        this.physicsInterval = setInterval(update, 1000/60);
    }
}
// Returns true on every nth frame
function everyinterval(n) {
    if ((scene.frameNo / n) % 1 == 0) return true;
    else return false;
}
// Updates physics and engine

// Object, which has coords, size, and components
function object(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}
// Components that can be added to an object
function addtorenderlayer(renderer, layer) {
    while (renderedObjects.length <= layer) {
        renderedObjects.push([]);
    }
    renderedObjects[layer].push(renderer);
}
function physics(speedx, speedy, gravity, bounce, friction, object) {
    this.index = physicsObjects.push(this);
    this.object = object;
    this.gravity = gravity;
    this.friction = friction;
    this.bounce = bounce; // bounce factor when collides, applied to speed in - direction
    this.speedx = speedx;
    this.speedy = speedy;
    this.update = function() {
        // Update speed
        this.speedy += this.gravity;
        this.speedx *= friction;
        console.log("gravity increase, speed now " + this.speedy);
        // Check collision
        var check = this.checkcollisions(this.speedx, this.speedy, true);
        console.log("check: " + check);
        // Update position
        if (check % 2 == 1) this.speedx *= -this.bounce;
        this.object.x += this.speedx;
        if (check > 1) this.speedy *= -this.bounce;
        this.object.y += this.speedy;
        console.log("after check speed is: " + this.speedy);
    }
    this.checkcollisions = function(offsetx, offsety, bounceOther) {
        for (i = 0; i < physicsObjects.length; i++) {
            if (i != this.index - 1) {
                var check = this.collides(offsetx, offsety, physicsObjects[i].object)
                if (bounceOther) {
                    if (check % 2 == 1) {
                        physicsObjects[i].speedx *= -physicsObjects[i].bounce;
                    }
                    if (check > 1) {
                        physicsObjects[i].speedy *= -physicsObjects[i].bounce;
                    }
                }
                return check;
            }
        }
    }
    this.collides = function(offsetx, offsety, otherobj) {
        var myleft = this.object.x + offsetx;
        var myright = this.object.x + offsetx + this.object.width;
        var mytop = this.object.y + offsety;
        var mybottom = this.object.y + offsety + this.object.height;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + otherobj.width;
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + otherobj.height;
        var collides = 0;
        if ((mybottom < othertop) ||
        (mytop > otherbottom) ||
        (myright < otherleft) ||
        (myleft > otherright)) {
            return 0; 
        }
        else {
            myleft = this.object.x;
            myright = this.object.x + this.object.width;
            if ((myright < otherleft) ||
            (myleft > otherright))
                collides = 1; // x offset causes collision

            myleft = this.object.x + offsetx;
            myright = this.object.x + offsetx + this.object.width;
            mytop = this.object.y;
            mybottom = this.object.y + this.object.height;
            if ((mybottom < othertop) ||
            (mytop > otherbottom)) 
                collides += 2; // y offset causes collision
            return collides;
        }
    }
}
function renderer(layer, object, color) {
    addtorenderlayer(this, layer);
    this.object = object;
    this.color = color;
    this.render = function() {
        ctx = scene.context;
        ctx.fillStyle = color;
        ctx.fillRect(
            scene.camera.x + this.object.x / scene.camera.zoom, 
            scene.camera.y + this.object.y / scene.camera.zoom, 
            this.object.width, this.object.height);
    } // should be altered to cull things outside frame
}
function action(object) {
    this.object = object;
    actionObjects.push(this);
    this.startaction = function() {

    }
    this.updateaction = function() {

    }
    this.updatefixedaction = function() {

    }
}