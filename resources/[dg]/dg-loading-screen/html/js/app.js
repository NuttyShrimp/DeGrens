window.addEventListener('message', function (e) {
  if (e.data.eventName === 'loadProgress') {
    // const loaded = parseInt(e.data.loadFraction * 100);
    setIconLoaded(Number(e.data.loadFraction));
  }
  if (e.data.shutDown) {
    const video = document.querySelector('#bg > video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    return;
  }
});

// video resize shit
const video = document.querySelector('#bg > video');
window.addEventListener('resize', resize, false);
video.volume = 0.7;

if (video) {
  video.height = 100; /* to get an initial width to work with*/
  video.play();
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

// Icon loading
const logoContainer = document.getElementById('inner_logo_container');
const logoImg = document.getElementById('logo_fg');

const setIconLoaded = perc => {
  logoContainer.style.top = `${13 - perc * 13}vh`;
  logoImg.style.top = `-${13 - perc * 13}vh`;
};

async function emulateLoading() {
  for (let i = 0; i <= 100; i++) {
    window.postMessage({ eventName: 'loadProgress', loadFraction: i / 100 }, 'http://localhost:3000');
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * (501 - 100)) + 100));
  }
}

window.onload = () => {
  document.getElementById('volume').onchange = e => {
    const vol = e.currentTarget.value;
    if (!video) return;
    video.volume = vol;
  };
};
