var physicsObjects = []; // 1D array of physics objects
physicsObjects.name = "phyicsObjects";
var renderedObjects = []; // 2D array of render layers (0 is background)
renderedObjects.name = "renderedObjects";
var actionObjects = []; // list of action scripts to run
actionObjects.name = "actionObjects";
var objects = [];
objects.name = "objects";
var textobjects = [];
textobjects.name = "textobjects";
var deltatime = 1000/60;
const d = new Date();
var lastframe = d.getTime();


const debugLevel = 1; // 0 shows no logs, 1 shows single events, 2 shows logs every frame

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
    if (scene.renderInterval) {
        clearInterval(scene.renderInterval);
        scene.renderInterval = setInterval(render, 1000/value);
    }
    // if (scene.physicsInterval) {
    //     clearInterval(scene.physicsInterval);
    //     scene.physicsInterval = setInterval(update, 1000/value);
    // }
}
function update() { // physics update (NOT FRAME RENDERING)
    scene.frameNo++;
    // Do any everyinterval logic here

    // Update physics
    for (p = 0; p < physicsObjects.length; p++) {
        physicsObjects[p].update();
    }
    for (i = 0; i < actionObjects.length; i++) {
        actionObjects[i].updatefixedaction();
    }
}
function render() { // frame update
    deltatime = d.getTime()-lastframe; // get time in ms since last frame
    scene.clear();
    for (i = 0; i < renderedObjects.length; i++) {
        for (j = 0; j < renderedObjects[i].length; j++) {
            renderedObjects[i][j].render();
        }
    }
    for (t = 0; t < textobjects.length; t++) {
        textobjects[t].render();
    }
    for (i = 0; i < actionObjects.length; i++) {
        actionObjects[i].updateaction();
    }
    // update input
    scene.mouseDown = false;
    scene.keysdown = [];
}
function camera(x, y, worldx, worldy, zoom) {
    this.x = x;
    this.y = y;
    this.worldx = worldx;
    this.worldy = worldy;
    this.zoom = zoom; // zoom should be at least 1, or objects might not appear to move smoothly
    this.objectoutofframe = function(x, y, w, h) { // returns how far out of frame object is
        let objleft = x;
        let objright = x + w;
        let objtop = y;
        let objbottom = y + h;
        let camwidth = scene.width/(2*this.zoom);
        let camheight = scene.height/(2*this.zoom);

        let distance = 0
        distance += Math.max(0, this.worldx - camwidth - objright);
        distance += Math.max(0, objleft - this.worldx - camwidth);
        distance += Math.max(0, this.worldy - camheight - objbottom);
        distance += Math.max(0, objtop - this.worldy - camheight);
        return distance;
    }
}
// Active scene
var scene = {
    canvas : document.createElement("canvas"),
    start : function() {
        // Create and insert canvas
        this.width = innerWidth;
        this.height = innerWidth * (9/16);
        this.camera = new camera(this.width/2, this.height/2, 0, 0, this.width/1000);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.canvas.id = "gameCanvas";
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // Set framerate and physics intervals
        this.frameNo = 0;
        this.physicsInterval = setInterval(update, 1000/60);
        this.renderInterval = setInterval(render, 1000/60);

        // Add listeners for mouse and keyboard
        window.addEventListener('mousedown', function (e) {
            scene.mouseHeld = true;
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
            scene.mouseHeld = false;
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
    addtolist(this, objects);
    this.remove = function() {
        removefromlist(this, objects);
    }
    if (debugLevel > 0) console.log("Object number " + this.index + " added.");
}
function physics(speedx, speedy, gravity, bounce, friction, object, dynamic) {
    this.object = object;
    this.gravity = gravity;
    this.friction = friction;
    this.dynamic = dynamic;
    this.bounce = bounce; // bounce factor when collides, applied to speed in - direction
    this.speedx = speedx;
    this.speedy = speedy;
    addtolist(this, physicsObjects);
    if (debugLevel > 0) {
        console.log("Physics obj added");
        console.log("New physics aray looks like:");
        for (i = 0; i < physicsObjects.length; i++) {
            console.log("\n" + physicsObjects[i].object.index);
        }
    }
    this.remove = function() {
        removefromlist(this, physicsObjects);
    }
    this.oncollision = function(check) {

    }
    this.update = function() {
        if (this.dynamic) {
            if (debugLevel > 1) console.log("Updating " + this.object.index);
            // Update speed
            this.speedy += this.gravity;
            this.speedx *= friction;
            // Check collision
            var check = this.checkcollisions(this.speedx, this.speedy, true);
            // Update position
            if (check % 2 == 1) this.speedx *= -this.bounce;
            this.object.x += this.speedx;
            if (check > 1) this.speedy *= -this.bounce;
            this.object.y += this.speedy;

            if (check) this.oncollision(check);
        }
    }
    this.checkcollisions = function(offsetx, offsety, bounceOther) {
        var finalcheck = 0;
        for (i = 0; i < physicsObjects.length; i++) {
            if (i != this.index) {
                if (debugLevel > 1) console.log("Checking collisions between object " + this.object.index + " and " + physicsObjects[i].object.index);
                var check = this.collides(offsetx, offsety, physicsObjects[i].object)
                if (check) {
                    if (bounceOther) {
                        console.log("Running oncollision for object " + physicsObjects[i].object.index)
                        physicsObjects[i].oncollision(check);
                        if (check % 2 == 1) {
                            physicsObjects[i].speedx *= -physicsObjects[i].bounce;
                            if (debugLevel > 1) console.log("Object " + this.object.index + " collides with " + physicsObjects[i].object.index + " horizontally");
                        }
                        if (check > 1) {
                            physicsObjects[i].speedy *= -physicsObjects[i].bounce;
                            if (debugLevel > 1) console.log("Object " + this.object.index + " collides with " + physicsObjects[i].object.index + " vertically");
                        }
                    }
                    if (check == 1) finalcheck += 1;
                    if (check == 2) finalcheck += 2;
                    if (finalcheck > 3 || check == 3) {
                        return 3;
                    }
                }
            }
        }
        return finalcheck;
    }
    this.collides = function(offsetx, offsety, otherobj) {
        let myleft = this.object.x + offsetx;
        let myright = this.object.x + offsetx + this.object.width;
        let mytop = this.object.y + offsety;
        let mybottom = this.object.y + offsety + this.object.height;
        let otherleft = otherobj.x;
        let otherright = otherobj.x + otherobj.width;
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + otherobj.height;
        let collides = 0;
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
function removefromlist(object, list) {
    if (debugLevel > 0) console.log("Removing object at index " + object.index + " in " + list.name);
    list.splice(object.index, 1); // splice out object from list
    for (r = object.index; r < list.length; r++) { // update index value of other objects (so they know)
        if (debugLevel > 0) console.log("Updating object at index " + list[r].index + " to index " + (list[r].index - 1));
        list[r].index--;
    }
}
function addtolist(object, list) {
    if (debugLevel > 0) console.log("Adding object to " + list.name + " at index " + list.length);
    object.index = list.push(object) - 1;
}
// Components that can be added to an object
function addtorenderlayer(renderer, layer) {
    if (debugLevel > 0) console.log("Adding object to render layer " + layer);
    while (renderedObjects.length <= layer) {
        if (debugLevel > 0) console.log("Additional layer needed, adding layer " + renderedObjects.length);
        let newlayer = [];
        newlayer.name = "render layer " + renderedObjects.length;
        renderedObjects.push(newlayer);
    }
    addtolist(renderer, renderedObjects[layer]);
    if (debugLevel > 0) {
        console.log("Renderer added to layer " + (renderedObjects.length-1));
        console.log("New 2d renderer aray looks like:");
        for (i = 0; i < renderedObjects.length; i++) {
            console.log("\nLayer " + i + ":\n");
            for (j = 0; j < renderedObjects[i].length; j++) {
                console.log(renderedObjects[i][j].object.index + ", ");
            }
        }
    }
}
function renderer(layer, object, color) {
    this.layer = layer;
    this.object = object;
    this.color = color;
    addtorenderlayer(this, layer);
    this.render = function() {
        if (debugLevel > 1) console.log("Rendering layer " + this.layer + " object " + this.object.index);
        ctx = scene.context;
        ctx.fillStyle = this.color;
        if (this.object.physics) {
            ctx.fillRect(
                scene.camera.x + (this.object.x + (this.object.physics.speedx * deltatime) - scene.camera.worldx) * scene.camera.zoom, 
                scene.camera.y + (this.object.y + (this.object.physics.speedy * deltatime) - scene.camera.worldy) * scene.camera.zoom, 
                this.object.width * scene.camera.zoom, this.object.height * scene.camera.zoom);
        }
        else {
            ctx.fillRect(
                scene.camera.x + (this.object.x - scene.camera.worldx) / scene.camera.zoom, 
                scene.camera.y + (this.object.y - scene.camera.worldy) / scene.camera.zoom, 
                this.object.width * scene.camera.zoom, this.object.height * scene.camera.zoom);
        }
    } // should be altered to cull things outside frame
    this.remove = function() {
        //remove from array renderedObjects[layer]
        removefromlist(this, renderedObjects[this.layer]);
    }
}
function textbox(size, font, color, x, y, text) {
    this.size = size;
    this.font = font;
    this.color = color;
    this.x = x;
    this.y = y;
    this.text = text;
    addtolist(this, textobjects);
    this.render = function() {
        ctx = scene.context;
        ctx.font = this.size + " " + this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }
    this.remove = function() {
        removefromlist(this, textobjects);
    }
}
function action(object) {
    this.object = object;
    addtolist(this, actionObjects);
    this.remove = function() {
        removefromlist(this, actionObjects);
    }
    this.startaction = function() {

    }
    this.updateaction = function() {

    }
    this.updatefixedaction = function() {

    }
}