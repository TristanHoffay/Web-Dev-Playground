var myGamePiece;
var myObstacle;

function startGame() {
    myGamePiece = new component(30, 30, "red", 10, 120)
    myObstacle = new component(10, 200, "green", 300, 120);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        //this.canvas.style.cursor = "none";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 1000/165);
        window.addEventListener('mousedown', function (e) {
            myGameArea.mouseDown = true;
            myGameArea.mousex = e.pageX;
            myGameArea.mousey = e.pageY;
        })
        window.addEventListener('mousemove', function (e) {
            if (myGameArea.mouseDown) {
                myGameArea.mousex = e.pageX;
                myGameArea.mousey = e.pageY;
            }
        })
        window.addEventListener('mouseup', function (e) {
            myGameArea.mouseDown = false;
        })
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.key.toUpperCase()] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.key.toUpperCase()] = false;
        })
    },
    clear : function() {
        this. context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + this.width;
        var mytop = this.y;
        var mybottom = this.y + this.height;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + otherobj.width;
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + otherobj.height;
        var crash = true;
        if ((mybottom < othertop) ||
        (mytop > otherbottom) ||
        (myright < otherleft) ||
        (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    if (myGamePiece.crashWith(myObstacle)) {
        myGameArea.stop();
    } else {
        myGameArea.clear();
        myObstacle.update();
        // if (myGameArea.mouseDown)
        // {
        //     myGamePiece.x = myGameArea.mousex;
        //     myGamePiece.y = myGameArea.mousey;
        // }
        myGamePiece.speedX = 0;
        myGamePiece.speedY = 0;
        if (myGameArea.keys && myGameArea.keys["A"]) {myGamePiece.speedX = -1;}
        if (myGameArea.keys && myGameArea.keys["D"]) {myGamePiece.speedX = 1;}
        if (myGameArea.keys && myGameArea.keys["W"]) {myGamePiece.speedY = -1;}
        if (myGameArea.keys && myGameArea.keys["S"]) {myGamePiece.speedY = 1;}
        myGamePiece.newPos();
        myGamePiece.update();
    }
}