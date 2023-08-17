const openAng = () => {
  $('.ang-container').css('display', 'block').css("opacity", "100%");
};

const closeAng = () => {
  $('.ang-container').css('display', 'none').css("opacity", "100%"); 
  $.post(`https://${GetParentResourceName()}/angClosed`, JSON.stringify({}));
};

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    window.addEventListener('message', function(event) {
      if (event.data.action == 'openAng') {
        $("#ang-iframe").attr("src", `https://${event.data.site}.degrensrp.be/`);
        openAng();
      }
    });
  }
};

$(document).on('keydown', function() {
  switch (event.keyCode) {
    case 27: // ESC
      closeAng();
      break;
  }
});

$("#ang-iframe").on("mouseenter", () => {
  $(".ang-container").css('opacity',  "100%");
})

$("#ang-iframe").on("mouseleave", () => {
  $(".ang-container").css('opacity',  "50%");
})