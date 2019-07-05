"use strict";
function main() {
    var game = new ex.Engine({
        width: 800,
        height: 600
    });
    game.start();
}
document.body.onload = main;
