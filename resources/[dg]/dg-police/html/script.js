const openAng = () => {
  $('.ang-container').css('display', 'block').css('user-select', 'none');
  $('.ang-container iframe').css('display', 'block');
  $('.tablet-frame').css('display', 'block').css('user-select', 'none');
  $('.ang-bg').css('display', 'block');
};

const closeAng = () => {
  $('.ang-container iframe').css('display', 'none');
  $('.ang-container').css('display', 'none');
  $('.tablet-frame').css('display', 'none');
  $('.ang-bg').css('display', 'none');
  $.post(`https://${GetParentResourceName()}/angClosed`, JSON.stringify({}));
};

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    window.addEventListener('message', function (event) {
      if (event.data.action == 'openAng') {
        openAng();
      }
    });
  }
};

$(document).on('keydown', function () {
  switch (event.keyCode) {
    case 27: // ESC
      closeAng();
      break;
  }
});
