function TestGame() {
    // Create and modify objects and stuff here for specific game usage
    var player;
    var platforms = [];
    platforms.name = "platforms";
    var lastplatformx = 500;
    var score;




    // // Create a player
    // player = new object(0, 0, 50, 50);
    // player.renderer = new renderer(2, player, "red");
    // player.physics = new physics(0,0,0,0.5, player);
    // var playerAction = new action(player);
    // playerAction.updateaction = function() {
    //     if (scene.keys && scene.keys["A"]) {player.physics.speedx = -1;}
    //     if (scene.keys && scene.keys["D"]) {player.physics.speedx = 1;}
    //     if (scene.keys && scene.keys["W"]) {player.physics.speedy = -1;}
    //     if (scene.keys && scene.keys["S"]) {player.physics.speedy = 1;}
    // }
    // player.action = playerAction;

    // Create score
    score = new textbox("30px", "Verdana", "black", 100, 40, "Score: 0");
    score.score = 0;
    // Create debug info
    if (debugLevel > 0) {
        var camZoomText = new textbox("20px", "Verdana", "black", 100, 60, "Camera Zoom: ")
        new action(camZoomText).updateaction = function() {camZoomText.text = "Camera Zoom: " + scene.camera.zoom}
    }
    // Create a player
    player = new object(0, 0, 50, 50);
    player.renderer = new renderer(2, player, "red");
    player.physics = new physics(0,0,0.8,0, 0.8, player, true);
    var playerAction = new action(player);
    playerAction.jumping = 0;
    playerAction.nextHeight = 100;
    // player.physics.oncollision = function(check) {
    //     if (check > 1)
    //         playerAction.jumping = false;
    // }
    playerAction.updateaction = function() {
        if (scene.keys && scene.keys["I"]) {scene.camera.zoom *= 1.01}
        if (scene.keys && scene.keys["O"]) {scene.camera.zoom /= 1.01}
        if (scene.keys && scene.keys["A"]) {player.physics.speedx = -10;}
        if (scene.keys && scene.keys["D"]) {player.physics.speedx = 10;}
        if (scene.keysdown && scene.keysdown["W"] && player.physics.checkcollisions(0, 10, false)) 
        {player.physics.speedy = -10; playerAction.jumping = scene.frameNo;}
        if (scene.keys && scene.keys["W"] && playerAction.jumping > scene.frameNo - 20) { player.physics.speedy = -10;}
        if (player.y < scene.camera.worldy) {
            scene.camera.worldy = player.y
        }
        if (player.y < score.score) {
             score.score = player.y;
             score.text = "Score: " + -1 * Math.floor(score.score / 100);
        }
        if (player.y < playerAction.nextHeight + scene.height/(2*scene.camera.zoom)) {
            playerAction.nextHeight -= 200;
            let nextx = (Math.random() * 1000) - 500;
            nextx = nextx < lastplatformx-400 ? lastplatformx-400 : nextx > lastplatformx + 400 ? lastplatformx + 400 : nextx;
            lastplatformx = nextx;
            platform(nextx, playerAction.nextHeight, 100, 20);
            platform(Math.random() * 1000 - 500, playerAction.nextHeight, 100, 20);
            
            fallingplatform((Math.random() * 1000) - 500, playerAction.nextHeight - 100, 100, 20);
        }
        if (scene.camera.objectoutofframe(player.x, player.y, player.w, player.h)) {
            // game over





            
        }
    }
    player.action = playerAction;


    // Create ground
    function platform (x, y, w, h) {
        let ground = new object(x, y, w, h);
        ground.renderer = new renderer(1, ground, "green");
        ground.physics = new physics(0, 0, 0, 0, 0, ground, false);
        addtolist(this, platforms);
        var platAction = new action(ground);
        platAction.updateaction = function() {
            if (scene.camera.objectoutofframe(ground.x, ground.y, ground.width, ground.height) > 500) {
                ground.renderer.remove();
                ground.physics.remove();
                ground.remove();
                removefromlist(this, platforms);
                platAction.remove();
            }
        }
    }
    function fall(physicobject) {
        physicobject.gravity = 1;
        physicobject.dynamic = true;
    }
    function fallingplatform (x, y, w, h) {
        let ground = new object(x, y, w, h);
        ground.renderer = new renderer(1, ground, "yellow");
        ground.physics = new physics(0, 0, 0, 0, 0, ground, false);
        ground.physics.oncollision = function(check) {
            ground.physics.object.renderer.color = "red";
            setTimeout(fall, 500, ground.physics);
        }
        addtolist(this, platforms);
        var platAction = new action(ground);
        platAction.updateaction = function() {
            if (scene.camera.objectoutofframe(ground.x, ground.y, ground.width, ground.height) > 500) {
                ground.renderer.remove();
                ground.physics.remove();
                ground.remove();
                removefromlist(this, platforms);
                platAction.remove();
            }
        }
    }
    platform(-500, 100, 1000, 100);
    

    startGame();
}