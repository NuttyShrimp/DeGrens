const Interactions = {
	types: ["info", "success", "error"],
	animation: null
};

window.addEventListener('message', (event) => {
	switch (event.data.app) {
		case "interaction": {
			Interactions[event.data.action](event.data.data);
      break;
		}
		default:
			break;
	}
});

////////////////////////////////////////////////////////////////////////////////
// Interactions
////////////////////////////////////////////////////////////////////////////////
Interactions.open = (data) => {
	Interactions.clearTypeClass();
	$('.interaction-box').addClass(data.type);
	$('.interaction-msg').html(data.msg);
	Interactions.slideIn();
}

Interactions.close = () => {
	Interactions.slideOut();
}

Interactions.slideIn = () => {
	$('.interaction-wrapper').css({
		display: 'flex'
	})
	Interactions.animation = $('.interaction-box').animate(
		{
			marginLeft: "1%"
		}, {
			duration: 400,
			queue: false,
			step: () => {
				if (Interactions.oldanimation !== Interactions.animation) {
					return
				}
			},
		}
	);
	Interactions.oldanimation = Interactions.animation;
}

Interactions.slideOut = () => {
	Interactions.animation  = $('.interaction-box').animate(
		{
			marginLeft: "-20%",
		}, {
			duration: 400,
			queue: false,
			step: ()=>{
				if (Interactions.oldanimation !== Interactions.animation) {
					return
				}
			},
			complete: () => {
				if (Interactions.oldanimation === Interactions.animation) {
					$('.interaction-box').css('margin-left', '-20.0vh')
					$('.interaction-msg').html('');
					$('.interaction-wrapper').css({
						display: 'none'
					})
				}
			}
		}
	);
	Interactions.oldanimation = Interactions.animation;
}

Interactions.clearTypeClass = () => {
	Interactions.types.forEach(type => {
    if ($('.interaction-box').hasClass(type)) {
			$('.interaction-box').removeClass(type);
		}
  });
}