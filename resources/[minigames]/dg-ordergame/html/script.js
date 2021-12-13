Minigame = {}
Minigame.Functions = {}

Minigame.GridSize;
Minigame.SequenceLength;
Minigame.AmountOfTimes;
Minigame.ShowTime;
Minigame.InputTime;
Minigame.TimesCounter;

let sequence = {};
let currentTimeout;

// event gets called from client.lua to start game
$(document).ready(function() {
    window.addEventListener('message', function(event) {
        if (event.data.Action == "OpenGame") {
            Minigame.GridSize = event.data.GridSize;
            Minigame.SequenceLength = event.data.SequenceLength;
            Minigame.AmountOfTimes = event.data.AmountOfTimes;
            Minigame.ShowTime = event.data.ShowTime;
            Minigame.InputTime = event.data.InputTime;
            Minigame.Functions.StartGame();
        }
    });
});

// Open the window, load HTML and start game after 3 sec
Minigame.Functions.StartGame = function() {
    $('#container').show();
    loadHTML();
    setText("Manual Override Required", "");
    Minigame.TimesCounter = 1;

    setTimeout(() => {
        startRound();
    }, 3000);
}

// close window and post 
Minigame.Functions.FinishGame = function(success) {
    $("#container").hide();
    $.post('https://dg-ordergame/GameFinished', JSON.stringify({
        Result: success
    }))
}

// add event when clicked on block
$(document.body).on("click", ".show", onBlockClick);

// generate the sequence and return in array
function generateRandomSequence(length) {
    const min = 1, max = Math.pow(Minigame.GridSize, 2);
    let arr = [];

    while (arr.length < length) {
        const r = Math.floor(Math.random() * (max + 1 - min)) + min;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
}

// start the sequence game
function startRound() {
    sequence = generateRandomSequence(Minigame.SequenceLength);

    setMode("Blocks");
    showBlocks();
    showNumbers();

    setTimeout(() => {
        hideNumbers()
    }, Minigame.ShowTime * 1000)
}

// show the blocks
function showBlocks() {
    $(".block").each((i, element) => {
        let blockNum = element.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);

        if (sequence.includes(blockNum)) {
            element.classList.add("show");
        }
    });
}

// show numbers on blocks
function showNumbers() {
    Minigame.NumbersVisible = true;

    $(".block").each((i, element) => {
        let blockNum = element.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);

        for (let i = 0; i < sequence.length; i++) {
            if (blockNum == sequence[i]) {
                element.textContent = i + 1;
            }
        }
    });
}

// hide numbers on blocks
function hideNumbers() {
    Minigame.NumbersVisible = false;

    $(".block").each((i, element) => {
        element.textContent = '';
    });

    currentTimeout = setTimeout(function() {
        gameFinished(false);
    }, Minigame.InputTime * 1000);
}

function onBlockClick(e) {
    if (!Minigame.NumbersVisible) {
        let clickedBlock = e.target;

        let blockNum = clickedBlock.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);
    
        if (blockNum == sequence[0]) {
            sequence.shift();
            clickedBlock.classList.remove("show");
        } else {
            $(".show").each((i, element) => {
                element.classList.remove("show");
            })
            clearTimeout(currentTimeout)
            gameFinished(false);
            return;
        }
    
        if ($(".show").length == 0) {
            if (Minigame.TimesCounter == Minigame.AmountOfTimes) {
                clearTimeout(currentTimeout)
                gameFinished(true);
            } else {
                Minigame.TimesCounter++;
                clearTimeout(currentTimeout)
                startRound();
            }
        }
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
        Minigame.Functions.FinishGame(success);
    }, 3000);
}

// load html and set gridsize to css var
function loadHTML() {
    $("body").get(0).style.setProperty("--size", Minigame.GridSize);

    let string = "";
    for (let i = 1; i <= Math.pow(Minigame.GridSize, 2); i++) {
        string += "<div class='block block-" + i + "'></div>";
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
// Minigame.SequenceLength = 6;
// Minigame.AmountOfTimes = 3;
// Minigame.ShowTime = 1;
// Minigame.InputTime = 3;
// Minigame.Functions.StartGame();