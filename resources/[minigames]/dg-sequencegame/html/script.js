Minigame = {}
Minigame.Functions = {}

Minigame.GridSize;
Minigame.Length;
Minigame.Sequence = {};
Minigame.AmountOfTimes;
Minigame.TimesCounter;

let inputAllowed = false;
let previousBlockNum = 0;

// event gets called from client.lua to start game
$(document).ready(function() {
    window.addEventListener('message', function(event) {
        if (event.data.Action == "OpenGame") {
            Minigame.GridSize = event.data.GridSize;
            Minigame.Length = event.data.Length;
            Minigame.Functions.StartGame();
        }
    });
});

// Open the window, load HTML and start game after 3 sec
Minigame.Functions.StartGame = function() {
    $('#container').show();
    loadHTML()
    setText("Manual Override Required", "")

    setTimeout(() => {
        start()
    }, 3000);
}

// close window and post 
Minigame.Functions.FinishGame = function(success) {
    $("#container").hide();
    $.post('https://dg-sequencegame/GameFinished', JSON.stringify({
        Result: success
    }))
}

// add event when clicked on block
$(document.body).on("click", ".block", onBlockClick);

// generate the sequence and return in array
function generateSequence(length) {
    let array = [];
    let previousNumber;

    while (array.length < length) {
        let number;
        do {
            number = Math.floor(Math.random() * Math.pow(Minigame.GridSize, 2)) + 1;
        } while (number == previousNumber);

        array.push(number)
        previousNumber = number;
    }
    return array;
}

// start the sequence game
function start() {
    inputAllowed = false;
    previousBlockNum = 0;
    Minigame.Sequence = generateSequence(Minigame.Length);
    setMode("Blocks");
    
    for (let i = 0; i < Minigame.Sequence.length; i++) {
        setTimeout((number) => {
            $(".block-" + Minigame.Sequence[number])[0].classList.add("show");
        }, i * 1000, i)

        setTimeout((number) => {
            $(".block-" + Minigame.Sequence[number])[0].classList.remove("show");
            if (number == Minigame.Length - 1) inputAllowed = true;
        }, (i + 1) *  1000, i);
    }
}

// show the blocks
function showBlocks() {
    $(".block").each((i, element) => {
        let blockNum = element.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);

        if (Minigame.Sequence.includes(blockNum)) {
            element.classList.add("show");
        }
    });
}

function onBlockClick(e) {
    if (inputAllowed) {
        let clickedBlock = e.target;

        e.target.classList.add("show");
        setTimeout(() => {
            e.target.classList.remove("show");
        }, 150);

        let blockNum = clickedBlock.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);
    
        if (previousBlockNum != blockNum) {
            if (blockNum == Minigame.Sequence[0]) {
                Minigame.Sequence.shift();
            } else {
                setTimeout(() => {
                    gameFinished(false);
                }, 150);
                return;
            }
        
            if (Minigame.Sequence.length == 0) {
                setTimeout(() => {
                    gameFinished(true);
                }, 150);
            }
        }
        previousBlockNum = blockNum;
    }
}

// Set text in textbox and show it
function setText(text, state) {
    $("#text").html(text);
    $("#textBox").addClass(state);
    setMode("TextBox");
}

// choose to show text or blocks
function setMode(mode) {
    if (mode == "TextBox") {
        $("#textContainer").show();
        $("#grid").hide();
    } 
    if (mode == "Blocks") {
        $("#textContainer").hide();
        $("#grid").show();
    }
}

// function gets called when wrong block or all blockes get clicked
function gameFinished(success) {
    if (success) {
        setText("Manual Override Successful", "success");
    } else {
        setText("Manual Override Failed", "fail");
    }
    
    setTimeout(() => {
        Minigame.Functions.FinishGame(success)
    }, 3000);
}

// load html and set gridsize to css var
function loadHTML() {
    $("body").get(0).style.setProperty("--size", Minigame.GridSize);

    let string = "";

    for (let i = 1; i <= Math.pow(Minigame.GridSize, 2); i++) {
        string += "<div class='block block-" + i + "'></div>"
    }

    $("#grid").html(string);

    $("#textContainer").html(
        "<div id='textBox'>" + 
        "<p id='text'></p>" +
        "</div>"
    )
}

// for testing in browser
// Minigame.GridSize = 5;
// Minigame.Length = 6;
// Minigame.Functions.StartGame();