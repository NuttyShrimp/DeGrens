window.addEventListener('message', (e) => {
  switch (e.data.action) {
    case 'showReticle':
      if (e.data.show) {
        $('.container').show();
      } else {
        $('.container').hide();
      }
      break;
  }
});
