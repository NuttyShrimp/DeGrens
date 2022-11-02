window.addEventListener('message', function (e) {
  if (e.data.shutDown) {
    cleanupScreen();
    return;
  }
});

const video = document.querySelector('#id > video');
window.addEventListener('resize', resize, false);

if (video) {
  video.height = 100; /* to get an initial width to work with*/
  resize();
}

function resize() {
  videoRatio = video.height / video.width;
  windowRatio = window.innerHeight / window.innerWidth; /* browser size */

  if (windowRatio < videoRatio) {
    if (window.innerHeight > 50) {
      /* smallest video height */
      video.height = window.innerHeight;
    } else {
      video.height = 50;
    }
  } else {
    video.width = window.innerWidth;
  }
}
