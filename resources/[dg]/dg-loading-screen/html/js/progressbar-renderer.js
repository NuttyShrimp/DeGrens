//Cache to keep track of all progress values.
//This is need for the Math.max functions (so no backwards progressbars).
var progressCache = [];
let updateInterval;
let bg = {
  element: $('#bg'),
  move: 50,
  mustRun: true,
};

Init();

function Init() {
  moveBackGround();
  updateInterval = setInterval(UpdateSingle, 400);
}

function cleanupScreen() {
  clearInterval(updateInterval);
  bg.mustRun = false;
}

//Update the single progressbar.
function UpdateSingle() {
  UpdateTotalProgress();

  //var progressBar = document.getElementById("pb0");
  //progressBar.value = progressCache[10];

  document.querySelector('.yeet').style.width = progressCache[10] + '%';
}

// Update the total percentage loaded (above the progressbar on the right).
function UpdateTotalProgress() {
  //Set the total progress counter:
  var total = GetTotalProgress();
  //var totalProgress = document.getElementById("progress-bar-value");

  if (progressCache[10] != null) {
    total = Math.max(total, progressCache[10]);
  }

  //totalProgress.innerHTML = Math.round(total);
  progressCache[10] = total;
}

function moveBackGround() {
  bg.element.animate(
    {
      right: `${bg.move}vw`,
    },
    {
      duration: 30000,
      easing: 'linear',
      complete: function () {
        if (!bg.mustRun) return;
        bg.move = bg.move === 50 ? 0 : 50;
        moveBackGround();
      },
    }
  );
}
