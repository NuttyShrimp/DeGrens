window.addEventListener('message', e => {
  switch (e.data.action) {
    case 'showReticle':
      if (e.data.show) {
        $('.container').css('display', 'flex');
      } else {
        $('.container').css('display', 'none');
      }
      break;
  }
});
