// Create and modify objects and stuff here for specific game usage
var player;
var ground;


function TestGame() {
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

    // Create a player
    player = new object(0, 0, 50, 50);
    player.renderer = new renderer(2, player, "red");
    player.physics = new physics(0,0,0.5,0.2, 0.8, player);
    var playerAction = new action(player);
    playerAction.jumping = false;
    playerAction.updateaction = function() {
        if (scene.keys && scene.keys["A"]) {player.physics.speedx = -10;}
        if (scene.keys && scene.keys["D"]) {player.physics.speedx = 10;}
        if (scene.keysdown && scene.keysdown["W"] && player.physics.checkcollisions(0, 10, false)) 
        {player.physics.speedy = -15;}
    }
    player.action = playerAction;

    // Create ground
    ground = new object(-500, 100, 1000, 100);
    ground.renderer = new renderer(1, ground, "green");
    ground.physics = new physics(0, 0, 0, 0, 0, ground);


    startGame();
}