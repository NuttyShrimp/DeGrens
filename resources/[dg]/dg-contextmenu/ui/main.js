let activeMenu = {};
let originalMenu = {};
let parentKey = null;

const triggerActionEvent = (event, data = {}) => {
	fetch(`https://${GetParentResourceName()}/${event}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify(data)
	})
}

const searchParentMenu = (key, menu, parent) => {
	let retval = {
		menu: [],
		parent: null,
	}
	menu = menu || originalMenu;
	for (let element of menu) {
		if (String(element.key).toLowerCase() === String(key).toLowerCase()) {
			retval = {
				menu: menu,
				parent: parent || null,
			}
			break;
		}
		if (element.submenus) {
			const submenus = searchParentMenu(key, element.submenus, element.key);
      if (submenus) {
        retval = submenus;
        break;
      }
		}
  }
	return retval;
}

const clickHandler = (m) => {
	if (m.action) {
		triggerActionEvent("triggerCMAction", {action: m.action, data: m.data, isServer: m.isServer || false});
		if (!m.submenus) {
			triggerActionEvent('close');
		}
	}
	if (m.submenus) {
		generateMenu(m.submenus);
		activeMenu = m.submenus;
		parentKey = m.key;
	}
	if (m.back) {
		if (parentKey === null) {
			triggerActionEvent('close');
			return;
		}
		const parentMenu = searchParentMenu(parentKey, originalMenu);
		generateMenu(parentMenu.menu);
		activeMenu = parentMenu.menu;
		parentKey = parentMenu.parent;
	}
}

const generateMenu = (menu) => {
	$('#buttons').html('');
	menu.forEach(m => {
		const buttonEl = document.createElement('div');
		$(buttonEl).addClass("button");
		$(buttonEl).data('id', m.key);

		const headerEl = document.createElement('div');
		$(headerEl).addClass("header");
		if (m.back) {
			const backBtn = document.createElement('div');
			$(backBtn).addClass("back-button");
			const chevronL = document.createElement('i');
			$(chevronL).addClass("fas fa-chevron-left");
			$(backBtn).append(chevronL);
			$(headerEl).append(backBtn);
		}
		$(headerEl).append(m.title);
		if (m.submenus) {
			const subBtn = document.createElement('div');
			$(subBtn).addClass("submenu-button");
			const chevronR = document.createElement('i');
			$(chevronR).addClass("fas fa-chevron-right");
			$(subBtn).append(chevronR);
			$(headerEl).append(subBtn);
		}
		$(buttonEl).append(headerEl);

		const bodyEl = document.createElement('div');
		$(bodyEl).addClass("txt");
		$(bodyEl).html(m.description);
		$(buttonEl).append(bodyEl);

		$(buttonEl).on('click', ()=>clickHandler(m));
		$('#buttons').append(buttonEl);
	})
}

const openMenu = (menu) => {
	activeMenu = menu;
	originalMenu = menu;
	generateMenu(menu)
}

const closeMenu = () => {
	activeMenu = {};
	originalMenu = {};
	parentKey = null;
	$('#buttons').html('')
}

window.addEventListener("message", (evt) => {
	switch (evt.data.action) {
		case "OPEN_MENU":
			return openMenu(evt.data.data);
		case "CLOSE_MENU":
			return closeMenu();
		default:
			return;
	}
})

window.addEventListener("keyup", (ev) => {
	if (ev.key === "Escape") {
		triggerActionEvent('close');
	}
})