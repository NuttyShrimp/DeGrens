Minigame = {}
Minigame.Functions = {}

Minigame.Amount;
Minigame.Difficulty;
Minigame.Counter;
Minigame.ValidKeys = ["w", "a", "s", "d"];

const lineWidth = 23
const color = "rgba(255, 255, 255, 1)";
const areaColor = "rgb(110, 120, 212)";
const backgroundColor = "rgba(0, 0, 0, 0.7)";

let canvas;
let ctx;
const arrows = ["🡱", "🡰", "🡳", "🡲"];

let currentGameLoop;
let currentKey;
let currentDegrees;
let startDegrees;
let endDegrees;
let changeDegrees;

// add event to listen to lua event
$(document).ready(() => {
    window.addEventListener('message', (event) => {
        if (event.data.Action == "OpenGame") {
            Minigame.Amount = event.data.Amount;
            Minigame.Difficulty = event.data.Difficulty;
            Minigame.Functions.StartGame();
        }
    });
});

// add event on keypress
document.addEventListener("keydown", function(e) {
    const key = e.key;
    if (Minigame.ValidKeys.includes(key)) {
        if (currentKey == key) {
            if (currentDegrees > startDegrees && currentDegrees < endDegrees) {
                Minigame.Counter++;
    
                if (Minigame.Counter == Minigame.Amount) {
                    Minigame.Functions.FinishGame(true);
                } else {
                    startRound();
                }
            } else {
                Minigame.Functions.FinishGame(false);
            }
        } else {
            Minigame.Functions.FinishGame(false);
        }
    }
});

// functions gets called by lua event to start multiple round
Minigame.Functions.StartGame = function() {
    $("#container").show();
    $("#container").html(`<canvas id="canvas" width="300" height="300"></canvas>`);

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    Minigame.Counter = 0;

    startRound();
}

// function gets called to callback to lua
Minigame.Functions.FinishGame = function(success) {
    if (typeof currentGameLoop !== undefined) {
        clearInterval(currentGameLoop);
    }

    canvas = null;
    ctx = null;

    $("#container").html('');
    $("#container").hide();

    $.post('https://dg-keygame/GameFinished', JSON.stringify({
        Result: success
    }));
}

// function to start one round
function startRound() {
    if (typeof currentGameLoop !== undefined) {
        clearInterval(currentGameLoop);
    }

    const size = Random(10, 20);
    startDegrees = Random(40, 85 - size);
    endDegrees = startDegrees + size;

    currentDegrees = 0;

    currentKey = Minigame.ValidKeys[Math.floor(Math.random() * Minigame.ValidKeys.length)];

    switch (Minigame.Difficulty) {
        case "easy":
            changeDegrees = Random(2, 4) / 100;
            break;
        case "medium":
            changeDegrees = Random(7, 20) / 100;
            break;
        case "hard":
            changeDegrees = Random(25, 35) / 100;
            break;
        case "extreme":
            changeDegrees = Random(45, 50) / 100;
            break;
    }

    currentGameLoop = setInterval(gameLoop, 1);
}

// functions gets called on interval according to speed 
function gameLoop() {
    if (currentDegrees >= 90) {
        Minigame.Functions.FinishGame(false);
    } else {
        currentDegrees += changeDegrees;
        draw();
    }
}

// draws the arcs every loop
function draw() {
    // Clear the canvas every time a chart is drawn
    ctx.clearRect(0, 0, 300, 300);

    // Background 180 degree arc
    ctx.beginPath();
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = lineWidth; 
    ctx.arc(150, 250, 200, DegToRad(225), DegToRad(315));
    ctx.stroke();

    // Green zone
    ctx.beginPath();
    ctx.strokeStyle = areaColor;
    ctx.lineWidth = lineWidth;
    ctx.arc(150, 250, 200, DegToRad(225) + DegToRad(startDegrees), DegToRad(225) + DegToRad(endDegrees));
    ctx.stroke();

    // Current degrees arc
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.arc(150, 250, 200, DegToRad(225), DegToRad(225) + DegToRad(currentDegrees));
    ctx.stroke();

    // Adding the key
    let arrow = arrows[Minigame.ValidKeys.indexOf(currentKey)]
    ctx.fillStyle = color;
    ctx.font = "100px sans-serif";
    let text_width = ctx.measureText(arrow).width;
    ctx.fillText(arrow, 150 - text_width / 2, 185);
}

// generate random number (inclusive)
function Random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// converts degrees to radians
function DegToRad(angle) {
    return angle * (Math.PI / 180);
}

// use to test in browser
// Minigame.Amount = 5;
// Minigame.Difficulty = "hard";
// Minigame.Functions.StartGame();