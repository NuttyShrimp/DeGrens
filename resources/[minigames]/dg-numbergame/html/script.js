Minigame = {}
Minigame.Functions = {}

Minigame.GridSize;
Minigame.Time;

let currentNumber = 1;
let timeout;

// event gets called from client.lua to start game
$(document).ready(function() {
    window.addEventListener('message', function(event) {
        if (event.data.Action == "OpenGame") {
            Minigame.GridSize = event.data.GridSize;
            Minigame.Time = event.data.Time;
            Minigame.Functions.StartGame();
        }
    });
});

// Open the window, load HTML and start game after 3 sec
Minigame.Functions.StartGame = function() {
    $('#container').show();
    loadHTML()
    setText("Manual Override Required", "")
    currentNumber = 1

    setTimeout(() => {
        setMode("Blocks");
        showNumbers();
        timeout = setTimeout(() => {
            gameFinished(false);
        }, Minigame.Time * 1000);
    }, 3000);
}

// close window and post 
Minigame.Functions.FinishGame = function(success) {
    $("#container").hide();
    $.post('https://dg-numbergame/GameFinished', JSON.stringify({
        Result: success
    }))
}

// add event when clicked on block
$(document.body).on("click", ".show", onBlockClick);

// show numbers on blocks
function showNumbers() {
    let amount = Math.pow(Minigame.GridSize, 2) + 1 - currentNumber;
    let sequence = Array.from({length: amount}, (_, i) => i + currentNumber)
    shuffle(sequence)

    $(".show").each((i, element) => {
        element.textContent = sequence[i];
    });
}

// shuffle array
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

function onBlockClick(e) {
    let clickedBlock = e.target;
    let clickedNumber = Number(clickedBlock.textContent);

    if (clickedNumber == currentNumber) {
        clickedBlock.classList.remove("show");
        clickedBlock.textContent = "";
        currentNumber++;
        showNumbers()
    } else {
        gameFinished(false);
        return;
    }

    if ($(".show").length == 0) {
        gameFinished(true);
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
    clearTimeout(timeout)

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
        string += "<div class='block show'></div>"
    }

    $("#grid").html(string);

    $("#textContainer").html(
        "<div id='textBox'>" + 
        "<p id='text'></p>" +
        "</div>"
    )
}

// for testing in browser
Minigame.GridSize = 3;
Minigame.Time = 12;
Minigame.Functions.StartGame();