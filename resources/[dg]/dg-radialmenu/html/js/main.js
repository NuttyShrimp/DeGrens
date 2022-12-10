'use strict';

var QBRadialMenu = null;

$(document).ready(function () {
  window.addEventListener('message', function (event) {
    createMenu(event.data.entries);
    QBRadialMenu.open();
  });
});

function createMenu(entries) {
  QBRadialMenu = new RadialMenu({
    parent: document.body,
    size: 375,
    menuItems: entries,
    onClick: function (entry) {
      if (entry.shouldClose) {
        QBRadialMenu.close();
      }

      $.post(
        `https://${GetParentResourceName()}/selectEntry`,
        JSON.stringify({
          entry,
        })
      );
    },
  });
}

$(document).on('keydown', function (e) {
  switch (e.key) {
    case 'Escape':
    case 'f1':
      QBRadialMenu.close();
      break;
  }
});
