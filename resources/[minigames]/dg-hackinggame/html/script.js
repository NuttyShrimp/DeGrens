HackingGame = {}
HackingGame.Functions = {}

HackingGame.SequenceLength;
HackingGame.Sequence = {};
HackingGame.NumbersVisible = true;
HackingGame.AmountOfTimes;
HackingGame.TimesCounter;

// event gets called from client.lua to start game
$(document).ready(function () {
    window.addEventListener('message', function (event) {
        if (event.data.Action == "ShowGame") {
            HackingGame.SequenceLength = event.data.SequenceLength;
            HackingGame.AmountOfTimes = event.data.AmountOfTimes;
            HackingGame.Functions.OpenGame();
        }
    });
});

// Open the window, load HTML and start game after 3 sec
HackingGame.Functions.OpenGame = function () {
    $("#container").show();
    LoadHTML()
    SetText("Manual Override Required", "")
    HackingGame.TimesCounter = 1;

    setTimeout(() => {
        StartGame()
    }, 3000);
}

// close window and post 
HackingGame.Functions.CloseGame = function () {
    $("#container").hide();
    $.post('https://dg-hackinggame/GameClose');
}

// generate the sequence and return in array
function GenerateRandomSequence(length) {
    const min = 1, max = 36;
    let arr = [];

    while (arr.length < length) {
        const r = Math.floor(Math.random() * (max + 1 - min)) + min;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
}

// add event when clicked on block
$(document.body).on("click", ".show", OnBlockClick);

// start the sequence game
function StartGame() {
    HackingGame.Sequence = GenerateRandomSequence(HackingGame.SequenceLength);

    Mode("Blocks");
    ShowBlocks();
    ShowNumbers();
}

// show the blocks
function ShowBlocks() {
    $(".block").each((i, element) => {
        let blockNum = element.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);

        if (HackingGame.Sequence.includes(blockNum)) {
            element.classList.add("show");
        }
    });
}

// show numbers on blocks
function ShowNumbers() {
    HackingGame.NumbersVisible = true;

    $(".block").each((i, element) => {
        let blockNum = element.classList.value.match(/(?:block-)(\d+)/)[1];
        blockNum = Number(blockNum);

        for (let i = 0; i < HackingGame.Sequence.length; i++) {
            if (blockNum == HackingGame.Sequence[i]) {
                element.textContent = i + 1;
            }
        }
    });
}

// hide numbers on blocks
function HideNumbers() {
    $(".block").each((i, element) => {
        element.textContent = '';
    });
}

function OnBlockClick(e) {
    if (HackingGame.NumbersVisible) {
        HackingGame.NumbersVisible = false
        HideNumbers()
    }

    let clickedBlock = e.target;

    let blockNum = clickedBlock.classList.value.match(/(?:block-)(\d+)/)[1];
    blockNum = Number(blockNum);

    if (blockNum == HackingGame.Sequence[0]) {
        HackingGame.Sequence.shift();
        clickedBlock.classList.remove("show");
    } else {
        $(".show").each((i, element) => {
            element.classList.remove("show");
        })
        GameFinished(false);
        return;
    }

    if ($(".show").length == 0) {
        if (HackingGame.TimesCounter == HackingGame.AmountOfTimes) {
            GameFinished(true);
        } else {
            HackingGame.TimesCounter++;
            StartGame();
        }
    }
}

// Set text in textbox and show it
function SetText(text, state) {
    $("#text").html(text);
    $("#textBox").addClass(state);
    Mode("TextBox");
}

// choose to show text or blocks
function Mode(mode) {
    if (mode == "TextBox") {
        $("#textBox").show();
        $(".block").hide();
    } 
    if (mode == "Blocks") {
        $("#textBox").hide();
        $(".block").show();
    }
}

// function gets called when wrong block or all blockes get clicked
function GameFinished(success) {
    if (success) {
        SetText("Manual Override Successful", "success");
    } else {
        SetText("Manual Override Failed", "fail");
    }
    
    setTimeout(() => {
        HackingGame.Functions.CloseGame()
        $.post('https://dg-hackinggame/GameFinished', JSON.stringify({
            Result: success
        }))
    }, 3000);
}


function LoadHTML() {
    $("#grid").html(
        "<div id='textBox'>" +
            "<p id='text'></p>" + 
        "</div>" +
        "<div class='block block-1'></div>" +
        "<div class='block block-2'></div>" +
        "<div class='block block-3'></div>" +
        "<div class='block block-4'></div>" +
        "<div class='block block-5'></div>" +
        "<div class='block block-6'></div>" +
        "<div class='block block-7'></div>" +
        "<div class='block block-8'></div>" +
        "<div class='block block-9'></div>" +
        "<div class='block block-10'></div>" +
        "<div class='block block-11'></div>" +
        "<div class='block block-12'></div>" +
        "<div class='block block-13'></div>" +
        "<div class='block block-14'></div>" +
        "<div class='block block-15'></div>" +
        "<div class='block block-16'></div>" +
        "<div class='block block-17'></div>" +
        "<div class='block block-18'></div>" +
        "<div class='block block-19'></div>" +
        "<div class='block block-20'></div>" +
        "<div class='block block-21'></div>" +
        "<div class='block block-22'></div>" +
        "<div class='block block-23'></div>" +
        "<div class='block block-24'></div>" +
        "<div class='block block-25'></div>" +
        "<div class='block block-26'></div>" +
        "<div class='block block-27'></div>" +
        "<div class='block block-28'></div>" +
        "<div class='block block-29'></div>" +
        "<div class='block block-30'></div>" +
        "<div class='block block-31'></div>" +
        "<div class='block block-32'></div>" +
        "<div class='block block-33'></div>" +
        "<div class='block block-34'></div>" +
        "<div class='block block-35'></div>" +
        "<div class='block block-36'></div>"
    );
}

// for testing in browser
//HackingGame.SequenceLength = 10;
//HackingGame.AmountOfTimes = 3;
//HackingGame.Functions.OpenGame();







