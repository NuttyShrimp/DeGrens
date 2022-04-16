var InventoryOption = '120, 10, 20';

var totalWeight = 0;
var totalWeightOther = 0;

var playerMaxWeight = 0;
var otherMaxWeight = 0;

var otherLabel = '';

var ClickedItemData = {};

var ControlPressed = false;
var selectedItem = null;

var IsDragging = false;

$(document).on('keydown', () => {
  switch (event.keyCode) {
    case 9: // TAB
      Inventory.Close();
      break;
    case 17: // CTRL
      ControlPressed = true;
      break;
    case 27: // ESC
      Inventory.Close();
      break;
  }
});

$(document).on('keyup', () => {
  switch (event.keyCode) {
    case 17: // CTRL
      ControlPressed = false;
      break;
  }
});

$(document).on('mouseenter', '.item-slot', function (event) {
  event.preventDefault();

  if ($(this).data('item') != null) {
    $('.ply-iteminfo-container').fadeIn(150);
    FormatItemInfo($(this).data('item'));
  } else {
    $('.ply-iteminfo-container').fadeOut(100);
  }
});

$(document).on('mousedown', '.item-slot', function (event) {
  if (event.which == 3) {
    fromSlot = $(this).attr('data-slot');
    fromInventory = $(this).parent();

    if ($(fromInventory).attr('data-inventory') == 'player') {
      toInventory = $('.other-inventory');
    } else {
      toInventory = $('.player-inventory');
    }

    toSlot = GetFirstFreeSlot(toInventory, $(this));

    if ($(this).data('item') === undefined) {
      return;
    }

    if (toSlot === null) {
      InventoryError(fromInventory, fromSlot);
      return;
    }

    if (fromSlot == toSlot && fromInventory == toInventory) {
      return;
    }

    toAmount = ControlPressed ? 1 : $(this).data('item').amount;

    if (toAmount >= 0) {
      if (updateweights(fromSlot, toSlot, fromInventory, toInventory, toAmount)) {
        Swap(fromSlot, toSlot, fromInventory, toInventory, toAmount);
      }
    }
  }

  $('#item-amount').focus();
});

function GetFirstFreeSlot($toInv, $fromSlot) {
  var retval = null;

  $.each($toInv.find('.item-slot'), (i, slot) => {
    if ($(slot).data('item') === undefined) {
      if (retval === null) {
        retval = i + 1;
      }
    }
  });

  return retval;
}

function FormatItemInfo(itemData) {
  $('.item-info-title').html('<p>' + itemData.label + '</p>');

  if (itemData != null && itemData.info != null && itemData.info != '') {
    if (itemData.name == 'id_card') {
      var gender = 'Man';
      if (itemData.info.gender == 1) {
        gender = 'Woman';
      }
      $('.item-info-description').html(
        '<p><strong>CSN: </strong><span>' +
          itemData.info.citizenid +
          '</span></p><p><strong>First Name: </strong><span>' +
          itemData.info.firstname +
          '</span></p><p><strong>Last Name: </strong><span>' +
          itemData.info.lastname +
          '</span></p><p><strong>Birth Date: </strong><span>' +
          itemData.info.birthdate +
          '</span></p><p><strong>Gender: </strong><span>' +
          gender +
          '</span></p><p><strong>Nationality: </strong><span>' +
          itemData.info.nationality +
          '</span></p>'
      );
    } else if (itemData.name == 'driver_license') {
      $('.item-info-description').html(
        '<p><strong>First Name: </strong><span>' +
          itemData.info.firstname +
          '</span></p><p><strong>Last Name: </strong><span>' +
          itemData.info.lastname +
          '</span></p><p><strong>Birth Date: </strong><span>' +
          itemData.info.birthdate +
          '</span></p><p><strong>Licenses: </strong><span>' +
          itemData.info.type +
          '</span></p>'
      );
    } else if (itemData.name == 'weaponlicense') {
      $('.item-info-description').html(
        '<p><strong>First Name: </strong><span>' +
          itemData.info.firstname +
          '</span></p><p><strong>Last Name: </strong><span>' +
          itemData.info.lastname +
          '</span></p><p><strong>Birth Date: </strong><span>' +
          itemData.info.birthdate +
          '</span></p>'
      );
    } else if (itemData.name == 'lawyerpass') {
      $('.item-info-description').html(
        '<p><strong>Pass-ID: </strong><span>' +
          itemData.info.id +
          '</span></p><p><strong>First Name: </strong><span>' +
          itemData.info.firstname +
          '</span></p><p><strong>Last Name: </strong><span>' +
          itemData.info.lastname +
          '</span></p><p><strong>CSN: </strong><span>' +
          itemData.info.citizenid +
          '</span></p>'
      );
    } else if (itemData.name == 'harness') {
      $('.item-info-description').html('<p>' + itemData.info.uses + ' uses left.</p>');
    } else if (itemData.name == 'meth_brick') {
      $('.item-info-description').html('<p> Meth Puurheid: ' + itemData.info.purity + '</p>');
    } else if (itemData.type == 'weapon') {
      if (itemData.info.ammo == undefined) {
        itemData.info.ammo = 0;
      } else {
        itemData.info.ammo != null ? itemData.info.ammo : 0;
      }

      $('.item-info-description').html(
        '<p><strong>Serie Nummer: </strong><span>' +
          itemData.info.serie +
          '</span></p><p><strong>Ammo: </strong><span>' +
          itemData.info.ammo +
          '</span></p><p>' +
          itemData.description +
          '</p>'
      );
    } else if (itemData.name == 'filled_evidence_bag') {
      if (itemData.info.type == 'casing') {
        $('.item-info-description').html(
          '<p><strong>Evidence material: </strong><span>' +
            itemData.info.label +
            '</span></p><p><strong>Type number: </strong><span>' +
            itemData.info.ammotype +
            '</span></p><p><strong>Caliber: </strong><span>' +
            itemData.info.ammolabel +
            '</span></p><p><strong>Serial Number: </strong><span>' +
            itemData.info.serie +
            '</span></p><p><strong>Crime scene: </strong><span>' +
            itemData.info.street +
            '</span></p><br /><p>' +
            itemData.description +
            '</p>'
        );
      } else if (itemData.info.type == 'blood') {
        $('.item-info-description').html(
          '<p><strong>Evidence material: </strong><span>' +
            itemData.info.label +
            '</span></p><p><strong>Blood type: </strong><span>' +
            itemData.info.bloodtype +
            '</span></p><p><strong>DNA Code: </strong><span>' +
            itemData.info.dnalabel +
            '</span></p><p><strong>Crime scene: </strong><span>' +
            itemData.info.street +
            '</span></p><br /><p>' +
            itemData.description +
            '</p>'
        );
      } else if (itemData.info.type == 'fingerprint') {
        $('.item-info-description').html(
          '<p><strong>Evidence material: </strong><span>' +
            itemData.info.label +
            '</span></p><p><strong>Vingerpatroon: </strong><span>' +
            itemData.info.fingerprint +
            '</span></p><p><strong>Plaats delict: </strong><span>' +
            itemData.info.street +
            '</span></p><br /><p>' +
            itemData.description +
            '</p>'
        );
      } else if (itemData.info.type == 'dna') {
        $('.item-info-description').html(
          '<p><strong>Evidence material: </strong><span>' +
            itemData.info.label +
            '</span></p><p><strong>DNA Code: </strong><span>' +
            itemData.info.dnalabel +
            '</span></p><br /><p>' +
            itemData.description +
            '</p>'
        );
      }
    } else if (itemData.info.costs != undefined && itemData.info.costs != null) {
      $('.item-info-description').html('<p>' + itemData.info.costs + '</p>');
    } else if (itemData.name == 'stickynote') {
      $('.item-info-description').html('<p>' + itemData.info.label + '</p>');
    } else if (itemData.name == 'moneybag') {
      $('.item-info-description').html(
        '<p><strong>Amount of cash: </strong><span>$' + itemData.info.cash + '</span></p>'
      );
    } else if (itemData.name == 'phone') {
      $('.item-info-description').html('<p><strong>Phone Number: </strong><span>' + itemData.info.phone);
    } else if (itemData.name == 'visa' || itemData.name == 'mastercard') {
      var str = '' + itemData.info.cardNumber + '';
      var res = str.slice(12);
      var cardNumber = '************' + res;
      $('.item-info-description').html(
        '<p><strong>Card Holder: </strong><span>' +
          itemData.info.name +
          '</span></p><p><strong>Citizen ID: </strong><span>' +
          itemData.info.citizenid +
          '</span></p><p><strong>Card Number: </strong><span>' +
          cardNumber +
          '</span></p>'
      );
    } else {
      $('.item-info-description').html('<p>' + itemData.description + '</p>');
    }
  } else {
    $('.item-info-description').html('<p>' + itemData.description + '</p>');
  }
}

function HandleDragDrop() {
  $('.item-drag').draggable({
    helper: 'clone',
    appendTo: 'body',
    scroll: true,
    revertDuration: 0,
    revert: 'invalid',
    cancel: '.item-nodrag',
    start: function (event, ui) {
      IsDragging = true;
      $(this).find('img').css('filter', 'brightness(50%)');

      var itemData = $(this).data('item');
      var dragAmount = ControlPressed ? 1 : $('#item-amount').val();
      if (!itemData.useable) {
        $('#item-use').css('background', 'transparent');
      }

      amount = ControlPressed ? 1 : itemData.amount;
      if (dragAmount == 0) {
        if (itemData.price != null) {
          $(this).find('.item-slot-amount p').html('0 (0.0)');
          $('.ui-draggable-dragging')
            .find('.item-slot-amount p')
            .html('(' + amount + ') $' + itemData.price);
          $('.ui-draggable-dragging').find('.item-slot-key').remove();
        } else {
          $(this).find('.item-slot-amount p').html('0 (0.0)');
          $('.ui-draggable-dragging')
            .find('.item-slot-amount p')
            .html(amount + ' (' + ((itemData.weight * amount) / 1000).toFixed(1) + ')');
          $('.ui-draggable-dragging').find('.item-slot-key').remove();
        }
      } else if (dragAmount > amount) {
        if (itemData.price != null) {
          $(this)
            .find('.item-slot-amount p')
            .html('(' + amount + ') $' + itemData.price);
        } else {
          $(this)
            .find('.item-slot-amount p')
            .html(amount + ' (' + ((itemData.weight * amount) / 1000).toFixed(1) + ')');
        }

        InventoryError($(this).parent(), $(this).attr('data-slot'));
      } else if (dragAmount > 0) {
        if (itemData.price != null) {
          $(this)
            .find('.item-slot-amount p')
            .html('(' + amount + ') $' + itemData.price);
          $('.ui-draggable-dragging')
            .find('.item-slot-amount p')
            .html('(' + amount + ') $' + itemData.price);
          $('.ui-draggable-dragging').find('.item-slot-key').remove();
        } else {
          $(this)
            .find('.item-slot-amount p')
            .html(amount - dragAmount + ' (' + ((itemData.weight * (amount - dragAmount)) / 1000).toFixed(1) + ')');
          $('.ui-draggable-dragging')
            .find('.item-slot-amount p')
            .html(dragAmount + ' (' + ((itemData.weight * dragAmount) / 1000).toFixed(1) + ')');
          $('.ui-draggable-dragging').find('.item-slot-key').remove();
        }
      } else {
        $('.ui-draggable-dragging').find('.item-slot-key').remove();
        $(this)
          .find('.item-slot-amount p')
          .html(amount + ' (' + ((itemData.weight * amount) / 1000).toFixed(1) + ')');
        InventoryError($(this).parent(), $(this).attr('data-slot'));
      }
    },
    stop: function () {
      setTimeout(function () {
        IsDragging = false;
      }, 300);
      $(this).css('background', 'rgba(0, 0, 0, 0.123)');
      $(this).find('img').css('filter', 'brightness(100%)');
      $('#item-use').css('background', 'transparent');
    },
  });

  $('.item-slot').droppable({
    hoverClass: 'item-slot-hoverClass',
    drop: function (event, ui) {
      setTimeout(function () {
        IsDragging = false;
      }, 300);
      fromSlot = ui.draggable.attr('data-slot');
      fromInventory = ui.draggable.parent();
      toSlot = $(this).attr('data-slot');
      toInventory = $(this).parent();
      toAmount = ControlPressed ? 1 : $('#item-amount').val();

      if (fromSlot == toSlot && fromInventory == toInventory) {
        return;
      }
      if (toAmount >= 0) {
        if (updateweights(fromSlot, toSlot, fromInventory, toInventory, toAmount)) {
          Swap(fromSlot, toSlot, fromInventory, toInventory, toAmount);
        }
      }
    },
  });

  $('#item-use').droppable({
    hoverClass: 'button-hover',
    drop: function (event, ui) {
      setTimeout(function () {
        IsDragging = false;
      }, 300);
      fromData = ui.draggable.data('item');
      fromInventory = ui.draggable.parent().attr('data-inventory');
      if (fromData.useable) {
        if (fromData.shouldClose) {
          Inventory.Close();
        }
        $.post(
          'https://dg-inventory/UseItem',
          JSON.stringify({
            inventory: fromInventory,
            item: fromData,
          })
        );
      }
    },
  });
}

function updateweights($fromSlot, $toSlot, $fromInv, $toInv, $toAmount) {
  var otherinventory = otherLabel.toLowerCase();

  // Stops you from swapping items in dropped inv
  // if (otherinventory.split("-")[0] == "dropped") {
  //     toData = $toInv.find("[data-slot=" + $toSlot + "]").data("item");
  //     if (toData !== null && toData !== undefined) {
  //         InventoryError($fromInv, $fromSlot);
  //         return false;
  //     }
  // }

  if (
    $fromInv.attr('data-inventory').split('-')[0] == 'itemshop' &&
    $toInv.attr('data-inventory').split('-')[0] == 'itemshop'
  ) {
    itemData = $fromInv.find('[data-slot=' + $fromSlot + ']').data('item');
    if ($fromInv.attr('data-inventory').split('-')[0] == 'itemshop') {
      $fromInv
        .find('[data-slot=' + $fromSlot + ']')
        .html(
          '<div class="item-slot-img"><img src="images/' +
            itemData.image +
            '" alt="' +
            itemData.name +
            '" /></div><div class="item-slot-amount"><p>(' +
            itemData.amount +
            ') $' +
            itemData.price +
            '</p></div><div class="item-slot-label"><p>' +
            itemData.label +
            '</p></div>'
        );
    } else {
      $fromInv
        .find('[data-slot=' + $fromSlot + ']')
        .html(
          '<div class="item-slot-img"><img src="images/' +
            itemData.image +
            '" alt="' +
            itemData.name +
            '" /></div><div class="item-slot-amount"><p>' +
            itemData.amount +
            ' (' +
            ((itemData.weight * itemData.amount) / 1000).toFixed(1) +
            ')</p></div><div class="item-slot-label"><p>' +
            itemData.label +
            '</p></div>'
        );
    }
    InventoryError($fromInv, $fromSlot);
    return false;
  }

  if ($toAmount == 0 && $fromInv.attr('data-inventory').split('-')[0] == 'itemshop') {
    itemData = $fromInv.find('[data-slot=' + $fromSlot + ']').data('item');
    if ($fromInv.attr('data-inventory').split('-')[0] == 'itemshop') {
      $fromInv
        .find('[data-slot=' + $fromSlot + ']')
        .html(
          '<div class="item-slot-img"><img src="images/' +
            itemData.image +
            '" alt="' +
            itemData.name +
            '" /></div><div class="item-slot-amount"><p>(' +
            itemData.amount +
            ') $' +
            itemData.price +
            '</p></div><div class="item-slot-label"><p>' +
            itemData.label +
            '</p></div>'
        );
    } else {
      $fromInv
        .find('[data-slot=' + $fromSlot + ']')
        .html(
          '<div class="item-slot-img"><img src="images/' +
            itemData.image +
            '" alt="' +
            itemData.name +
            '" /></div><div class="item-slot-amount"><p>' +
            itemData.amount +
            ' (' +
            ((itemData.weight * itemData.amount) / 1000).toFixed(1) +
            ')</p></div><div class="item-slot-label"><p>' +
            itemData.label +
            '</p></div>'
        );
    }

    InventoryError($fromInv, $fromSlot);
    return false;
  }

  if ($toInv.attr('data-inventory').split('-')[0] == 'itemshop') {
    itemData = $toInv.find('[data-slot=' + $toSlot + ']').data('item');
    if ($toInv.attr('data-inventory').split('-')[0] == 'itemshop') {
      $toInv
        .find('[data-slot=' + $toSlot + ']')
        .html(
          '<div class="item-slot-img"><img src="images/' +
            itemData.image +
            '" alt="' +
            itemData.name +
            '" /></div><div class="item-slot-amount"><p>(' +
            itemData.amount +
            ') $' +
            itemData.price +
            '</p></div><div class="item-slot-label"><p>' +
            itemData.label +
            '</p></div>'
        );
    } else {
      $toInv
        .find('[data-slot=' + $toSlot + ']')
        .html(
          '<div class="item-slot-img"><img src="images/' +
            itemData.image +
            '" alt="' +
            itemData.name +
            '" /></div><div class="item-slot-amount"><p>' +
            itemData.amount +
            ' (' +
            ((itemData.weight * itemData.amount) / 1000).toFixed(1) +
            ')</p></div><div class="item-slot-label"><p>' +
            itemData.label +
            '</p></div>'
        );
    }

    InventoryError($fromInv, $fromSlot);
    return false;
  }

  let ifErrorTotalWeight = totalWeight;
  let ifErrorTotalWeightOther = totalWeightOther;
  if ($fromInv.attr('data-inventory') != $toInv.attr('data-inventory')) {
    fromData = $fromInv.find('[data-slot=' + $fromSlot + ']').data('item');
    toData = $toInv.find('[data-slot=' + $toSlot + ']').data('item');
    if ($toAmount == 0) {
      $toAmount = fromData.amount;
    }
    if (toData == null || fromData.name == toData.name) {
      if ($fromInv.attr('data-inventory') == 'player') {
        totalWeight = totalWeight - fromData.weight * $toAmount;
        totalWeightOther = totalWeightOther + fromData.weight * $toAmount;
      } else {
        totalWeight = totalWeight + fromData.weight * $toAmount;
        totalWeightOther = totalWeightOther - fromData.weight * $toAmount;
      }
    } else {
      if ($fromInv.attr('data-inventory') == 'player') {
        totalWeight = totalWeight - fromData.weight * $toAmount;
        totalWeight = totalWeight + toData.weight * toData.amount;

        totalWeightOther = totalWeightOther + fromData.weight * $toAmount;
        totalWeightOther = totalWeightOther - toData.weight * toData.amount;
      } else {
        totalWeight = totalWeight + fromData.weight * $toAmount;
        totalWeight = totalWeight - toData.weight * toData.amount;

        totalWeightOther = totalWeightOther - fromData.weight * $toAmount;
        totalWeightOther = totalWeightOther + toData.weight * toData.amount;
      }
    }
  }

  if (
    totalWeight > playerMaxWeight ||
    (totalWeightOther > otherMaxWeight && $fromInv.attr('data-inventory').split('-')[0] != 'itemshop')
  ) {
    InventoryError($fromInv, $fromSlot);

    // totalweights were nonsensical so bring em back to what they were before to stop us from being unable to move anything after having error
    totalWeight = ifErrorTotalWeight;
    totalWeightOther = ifErrorTotalWeightOther;

    return false;
  }

  var per = totalWeight / 1000 / (playerMaxWeight / 100000);
  $('.pro').css('width', per + '%');
  $('#player-inv-weight').html(
    'Gewicht: ' + (parseInt(totalWeight) / 1000).toFixed(2) + ' / ' + (playerMaxWeight / 1000).toFixed(2) + ' kg'
  );
  if (
    $fromInv.attr('data-inventory').split('-')[0] != 'itemshop' &&
    $toInv.attr('data-inventory').split('-')[0] != 'itemshop'
  ) {
    $('#other-inv-label').html(otherLabel);
    $('#other-inv-weight').html(
      'Gewicht: ' + (parseInt(totalWeightOther) / 1000).toFixed(2) + ' / ' + (otherMaxWeight / 1000).toFixed(2) + ' kg'
    );
    var per1 = totalWeightOther / 1000 / (otherMaxWeight / 100000);
    $('.pro1').css('width', per1 + '%');
  }

  return true;
}

var combineslotData = null;

$(document).on('click', '.CombineItem', function (e) {
  e.preventDefault();
  if (combineslotData.toData.combinable.anim != null) {
    $.post(
      'https://dg-inventory/combineWithAnim',
      JSON.stringify({
        combineData: combineslotData.toData.combinable,
        usedItem: combineslotData.toData.name,
        requiredItem: combineslotData.fromData.name,
      })
    );
  } else {
    $.post(
      'https://dg-inventory/combineItem',
      JSON.stringify({
        reward: combineslotData.toData.combinable.reward,
        toItem: combineslotData.toData.name,
        fromItem: combineslotData.fromData.name,
      })
    );
  }
  Inventory.Close();
});

function optionSwitch($fromSlot, $toSlot, $fromInv, $toInv, $toAmount, toData, fromData) {
  fromData.slot = parseInt($toSlot);

  $toInv.find('[data-slot=' + $toSlot + ']').data('item', fromData);

  $toInv.find('[data-slot=' + $toSlot + ']').addClass('item-drag');
  $toInv.find('[data-slot=' + $toSlot + ']').removeClass('item-nodrag');

  if ($toSlot < 6) {
    $toInv
      .find('[data-slot=' + $toSlot + ']')
      .html(
        '<div class="item-slot-key"><p>' +
          $toSlot +
          '</p></div><div class="item-slot-img"><img src="images/' +
          fromData.image +
          '" alt="' +
          fromData.name +
          '" /></div><div class="item-slot-amount"><p>' +
          fromData.amount +
          ' (' +
          ((fromData.weight * fromData.amount) / 1000).toFixed(1) +
          ')</p></div><div class="item-slot-label"><p>' +
          fromData.label +
          '</p></div>'
      );
  } else {
    $toInv
      .find('[data-slot=' + $toSlot + ']')
      .html(
        '<div class="item-slot-img"><img src="images/' +
          fromData.image +
          '" alt="' +
          fromData.name +
          '" /></div><div class="item-slot-amount"><p>' +
          fromData.amount +
          ' (' +
          ((fromData.weight * fromData.amount) / 1000).toFixed(1) +
          ')</p></div><div class="item-slot-label"><p>' +
          fromData.label +
          '</p></div>'
      );
  }

  toData.slot = parseInt($fromSlot);

  $fromInv.find('[data-slot=' + $fromSlot + ']').addClass('item-drag');
  $fromInv.find('[data-slot=' + $fromSlot + ']').removeClass('item-nodrag');

  $fromInv.find('[data-slot=' + $fromSlot + ']').data('item', toData);

  if ($fromSlot < 6) {
    $fromInv
      .find('[data-slot=' + $fromSlot + ']')
      .html(
        '<div class="item-slot-key"><p>' +
          $fromSlot +
          '</p></div><div class="item-slot-img"><img src="images/' +
          toData.image +
          '" alt="' +
          toData.name +
          '" /></div><div class="item-slot-amount"><p>' +
          toData.amount +
          ' (' +
          ((toData.weight * toData.amount) / 1000).toFixed(1) +
          ')</p></div><div class="item-slot-label"><p>' +
          toData.label +
          '</p></div>'
      );
  } else {
    $fromInv
      .find('[data-slot=' + $fromSlot + ']')
      .html(
        '<div class="item-slot-img"><img src="images/' +
          toData.image +
          '" alt="' +
          toData.name +
          '" /></div><div class="item-slot-amount"><p>' +
          toData.amount +
          ' (' +
          ((toData.weight * toData.amount) / 1000).toFixed(1) +
          ')</p></div><div class="item-slot-label"><p>' +
          toData.label +
          '</p></div>'
      );
  }

  $.post(
    'https://dg-inventory/SetInventoryData',
    JSON.stringify({
      fromInventory: $fromInv.attr('data-inventory'),
      toInventory: $toInv.attr('data-inventory'),
      fromSlot: $fromSlot,
      toSlot: $toSlot,
      fromAmount: $toAmount,
      toAmount: toData.amount,
    })
  );
}

function SetQualityBar(item, $inv, $slot) {
  if (item.quality == undefined) {
    item.quality = 100.0;
  }
  var qualityColor = 'rgb(39, 174, 96)';

  if (item.quality <= 25) {
    qualityColor = 'rgb(192, 57, 43)';
  } else if (item.quality > 25 && item.quality < 50) {
    qualityColor = 'rgb(230, 126, 34)';
  } else if (item.quality >= 50) {
    qualityColor = 'rgb(39, 174, 96)';
  }

  if (item.quality !== undefined) {
    qualityLabel = item.quality.toFixed();
  } else {
    qualityLabel = item.quality;
  }

  if (item.quality == 0) {
    qualityLabel = 100;
  }

  $inv
    .find('[data-slot=' + $slot + ']')
    .find('.item-slot-quality-bar')
    .css({
      width: qualityLabel + '%',
      'background-color': qualityColor,
    });
}

function Swap($fromSlot, $toSlot, $fromInv, $toInv, $toAmount) {
  fromData = $fromInv.find('[data-slot=' + $fromSlot + ']').data('item');
  toData = $toInv.find('[data-slot=' + $toSlot + ']').data('item');
  var otherinventory = otherLabel.toLowerCase();

  // Stops u from swapping items in dropped inv
  // if (otherinventory.split("-")[0] == "dropped") {
  //     if (toData !== null && toData !== undefined) {
  //         InventoryError($fromInv, $fromSlot);
  //         return;
  //     }
  // }

  if (fromData !== undefined && fromData.amount >= $toAmount) {
    if (!fromData.stackable && $toAmount > 1) {
      InventoryError($fromInv, $fromSlot);
      return;
    }

    if ($fromInv.attr('data-inventory') == 'player' && $toInv.attr('data-inventory').split('-')[0] == 'itemshop') {
      InventoryError($fromInv, $fromSlot);
      return;
    }

    if ($toAmount == 0 && $fromInv.attr('data-inventory').split('-')[0] == 'itemshop') {
      InventoryError($fromInv, $fromSlot);
      return;
    } else if ($toAmount == 0) {
      $toAmount = fromData.amount;
    }

    if ((toData != undefined || toData != null) && toData.name == fromData.name && fromData.stackable) {
      var newData = [];
      newData.name = toData.name;
      newData.label = toData.label;
      newData.weight = toData.weight;
      newData.type = toData.type;
      newData.stackable = toData.stackable;
      newData.useable = toData.useable;
      newData.shouldClose = toData.shouldClose;
      newData.combinable = toData.combinable;
      newData.decayrate = toData.decayrate;
      newData.image = toData.image;
      newData.description = toData.description;
      newData.slot = parseInt($toSlot);
      newData.amount = parseInt($toAmount) + parseInt(toData.amount);
      newData.info = toData.info;
      newData.quality = toData.quality;

      if (fromData.amount == $toAmount) {
        $toInv.find('[data-slot=' + $toSlot + ']').data('item', newData);

        $toInv.find('[data-slot=' + $toSlot + ']').addClass('item-drag');
        $toInv.find('[data-slot=' + $toSlot + ']').removeClass('item-nodrag');

        var ItemLabel =
        '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
        newData.label +
        '</p></div>';

        if ($toSlot < 6 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>' +
                $toSlot +
                '</p></div><div class="item-slot-img"><img src="images/' +
                newData.image +
                '" alt="' +
                newData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newData.amount +
                ' (' +
                ((newData.weight * newData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else if ($toSlot == 41 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                newData.image +
                '" alt="' +
                newData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newData.amount +
                ' (' +
                ((newData.weight * newData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                newData.image +
                '" alt="' +
                newData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newData.amount +
                ' (' +
                ((newData.weight * newData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        }

        SetQualityBar(newData, $toInv, $toSlot);

        $fromInv.find('[data-slot=' + $fromSlot + ']').removeClass('item-drag');
        $fromInv.find('[data-slot=' + $fromSlot + ']').addClass('item-nodrag');

        $fromInv.find('[data-slot=' + $fromSlot + ']').removeData('item');
        $fromInv
          .find('[data-slot=' + $fromSlot + ']')
          .html('<div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>');
      } else if (fromData.amount > $toAmount) {
        var newDataFrom = [];
        newDataFrom.name = fromData.name;
        newDataFrom.label = fromData.label;
        newDataFrom.weight = fromData.weight;
        newDataFrom.type = fromData.type;
        newDataFrom.stackable = fromData.stackable;
        newDataFrom.useable = fromData.useable;
        newDataFrom.shouldClose = fromData.shouldClose;
        newDataFrom.combinable = fromData.combinable;
        newDataFrom.decayrate = fromData.decayrate;
        newDataFrom.image = fromData.image;
        newDataFrom.description = fromData.description;
        newDataFrom.slot = parseInt($fromSlot);
        newDataFrom.amount = parseInt(fromData.amount - $toAmount);
        newDataFrom.info = fromData.info;
        newDataFrom.quality = fromData.quality;

        $toInv.find('[data-slot=' + $toSlot + ']').data('item', newData);

        $toInv.find('[data-slot=' + $toSlot + ']').addClass('item-drag');
        $toInv.find('[data-slot=' + $toSlot + ']').removeClass('item-nodrag');

        var ItemLabel =
        '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
        newData.label +
        '</p></div>';

        if ($toSlot < 6 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>' +
                $toSlot +
                '</p></div><div class="item-slot-img"><img src="images/' +
                newData.image +
                '" alt="' +
                newData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newData.amount +
                ' (' +
                ((newData.weight * newData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else if ($toSlot == 41 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                newData.image +
                '" alt="' +
                newData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newData.amount +
                ' (' +
                ((newData.weight * newData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                newData.image +
                '" alt="' +
                newData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newData.amount +
                ' (' +
                ((newData.weight * newData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        }

        SetQualityBar(newData, $toInv, $toSlot);

        // From Data
        $fromInv.find('[data-slot=' + $fromSlot + ']').data('item', newDataFrom);

        $fromInv.find('[data-slot=' + $fromSlot + ']').addClass('item-drag');
        $fromInv.find('[data-slot=' + $fromSlot + ']').removeClass('item-nodrag');

        if ($fromInv.attr('data-inventory').split('-')[0] == 'itemshop') {
          $fromInv
            .find('[data-slot=' + $fromSlot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                newDataFrom.image +
                '" alt="' +
                newDataFrom.name +
                '" /></div><div class="item-slot-amount"><p>(' +
                newDataFrom.amount +
                ') $' +
                newDataFrom.price +
                '</p></div><div class="item-slot-label"><p>' +
                newDataFrom.label +
                '</p></div>'
            );
        } else {
          var ItemLabel =
          '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
          newDataFrom.label +
          '</p></div>';

          if ($fromSlot < 6 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>' +
                  $fromSlot +
                  '</p></div><div class="item-slot-img"><img src="images/' +
                  newDataFrom.image +
                  '" alt="' +
                  newDataFrom.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  newDataFrom.amount +
                  ' (' +
                  ((newDataFrom.weight * newDataFrom.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          } else if ($fromSlot == 41 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                  newDataFrom.image +
                  '" alt="' +
                  newDataFrom.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  newDataFrom.amount +
                  ' (' +
                  ((newDataFrom.weight * newDataFrom.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          } else {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-img"><img src="images/' +
                  newDataFrom.image +
                  '" alt="' +
                  newDataFrom.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  newDataFrom.amount +
                  ' (' +
                  ((newDataFrom.weight * newDataFrom.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          }

          SetQualityBar(newDataFrom, $fromInv, $fromSlot);
        }
      }
      $.post('https://dg-inventory/PlayDropSound', JSON.stringify({}));
      $.post(
        'https://dg-inventory/SetInventoryData',
        JSON.stringify({
          fromInventory: $fromInv.attr('data-inventory'),
          toInventory: $toInv.attr('data-inventory'),
          fromSlot: $fromSlot,
          toSlot: $toSlot,
          fromAmount: $toAmount,
        })
      );
    } else {
      if (fromData.amount == $toAmount) {
        if (
          toData != undefined &&
          toData.combinable != null &&
          isItemAllowed(fromData.name, toData.combinable.accept)
        ) {
          $.post(
            'https://dg-inventory/getCombineItem',
            JSON.stringify({ item: toData.combinable.reward }),
            function (item) {
              $('.combine-option-text').html('<p>If you combine these items you get: <b>' + item.label + '</b></p>');
            }
          );
          $('.combine-option-container').fadeIn(100);
          combineslotData = [];
          combineslotData.fromData = fromData;
          combineslotData.toData = toData;
          combineslotData.fromSlot = $fromSlot;
          combineslotData.toSlot = $toSlot;
          combineslotData.fromInv = $fromInv;
          combineslotData.toInv = $toInv;
          combineslotData.toAmount = $toAmount;
          return;
        }

        fromData.slot = parseInt($toSlot);

        $toInv.find('[data-slot=' + $toSlot + ']').data('item', fromData);

        $toInv.find('[data-slot=' + $toSlot + ']').addClass('item-drag');
        $toInv.find('[data-slot=' + $toSlot + ']').removeClass('item-nodrag');

        var ItemLabel =
        '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
        fromData.label +
        '</p></div>';

        if ($toSlot < 6 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>' +
                $toSlot +
                '</p></div><div class="item-slot-img"><img src="images/' +
                fromData.image +
                '" alt="' +
                fromData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                fromData.amount +
                ' (' +
                ((fromData.weight * fromData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else if ($toSlot == 41 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                fromData.image +
                '" alt="' +
                fromData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                fromData.amount +
                ' (' +
                ((fromData.weight * fromData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                fromData.image +
                '" alt="' +
                fromData.name +
                '" /></div><div class="item-slot-amount"><p>' +
                fromData.amount +
                ' (' +
                ((fromData.weight * fromData.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        }

        SetQualityBar(fromData, $toInv, $toSlot);

        if (toData != undefined) {
          toData.slot = parseInt($fromSlot);

          $fromInv.find('[data-slot=' + $fromSlot + ']').addClass('item-drag');
          $fromInv.find('[data-slot=' + $fromSlot + ']').removeClass('item-nodrag');

          $fromInv.find('[data-slot=' + $fromSlot + ']').data('item', toData);

          var ItemLabel =
          '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
          toData.label +
          '</p></div>';

          if ($fromSlot < 6 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>' +
                  $fromSlot +
                  '</p></div><div class="item-slot-img"><img src="images/' +
                  toData.image +
                  '" alt="' +
                  toData.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  toData.amount +
                  ' (' +
                  ((toData.weight * toData.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          } else if ($fromSlot == 41 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                  toData.image +
                  '" alt="' +
                  toData.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  toData.amount +
                  ' (' +
                  ((toData.weight * toData.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          } else {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-img"><img src="images/' +
                  toData.image +
                  '" alt="' +
                  toData.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  toData.amount +
                  ' (' +
                  ((toData.weight * toData.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          }

          SetQualityBar(toData, $fromInv, $fromSlot);

          $.post(
            'https://dg-inventory/SetInventoryData',
            JSON.stringify({
              fromInventory: $fromInv.attr('data-inventory'),
              toInventory: $toInv.attr('data-inventory'),
              fromSlot: $fromSlot,
              toSlot: $toSlot,
              fromAmount: $toAmount,
              toAmount: toData.amount,
            })
          );
        } else {
          $fromInv.find('[data-slot=' + $fromSlot + ']').removeClass('item-drag');
          $fromInv.find('[data-slot=' + $fromSlot + ']').addClass('item-nodrag');

          $fromInv.find('[data-slot=' + $fromSlot + ']').removeData('item');

          if ($fromSlot < 6 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>' +
                  $fromSlot +
                  '</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>'
              );
          } else if ($fromSlot == 41 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>'
              );
          } else {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html('<div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>');
          }

          $.post(
            'https://dg-inventory/SetInventoryData',
            JSON.stringify({
              fromInventory: $fromInv.attr('data-inventory'),
              toInventory: $toInv.attr('data-inventory'),
              fromSlot: $fromSlot,
              toSlot: $toSlot,
              fromAmount: $toAmount,
            })
          );
        }
        $.post('https://dg-inventory/PlayDropSound', JSON.stringify({}));
      } else if (fromData.amount > $toAmount && (toData == undefined || toData == null)) {
        var newDataTo = [];
        newDataTo.name = fromData.name;
        newDataTo.label = fromData.label;
        newDataTo.weight = fromData.weight;
        newDataTo.type = fromData.type;
        newDataTo.stackable = fromData.stackable;
        newDataTo.useable = fromData.useable;
        newDataTo.shouldClose = fromData.shouldClose;
        newDataTo.combinable = fromData.combinable;
        newDataTo.decayrate = fromData.decayrate;
        newDataTo.image = fromData.image;
        newDataTo.description = fromData.description;
        newDataTo.slot = parseInt($toSlot);
        newDataTo.amount = parseInt($toAmount);
        newDataTo.info = fromData.info;
        newDataTo.quality = fromData.quality;

        $toInv.find('[data-slot=' + $toSlot + ']').data('item', newDataTo);

        $toInv.find('[data-slot=' + $toSlot + ']').addClass('item-drag');
        $toInv.find('[data-slot=' + $toSlot + ']').removeClass('item-nodrag');

        var ItemLabel =
        '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
        newDataTo.label +
        '</p></div>';

        if ($toSlot < 6 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>' +
                $toSlot +
                '</p></div><div class="item-slot-img"><img src="images/' +
                newDataTo.image +
                '" alt="' +
                newDataTo.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newDataTo.amount +
                ' (' +
                ((newDataTo.weight * newDataTo.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else if ($toSlot == 41 && $toInv.attr('data-inventory') == 'player') {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                newDataTo.image +
                '" alt="' +
                newDataTo.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newDataTo.amount +
                ' (' +
                ((newDataTo.weight * newDataTo.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        } else {
          $toInv
            .find('[data-slot=' + $toSlot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                newDataTo.image +
                '" alt="' +
                newDataTo.name +
                '" /></div><div class="item-slot-amount"><p>' +
                newDataTo.amount +
                ' (' +
                ((newDataTo.weight * newDataTo.amount) / 1000).toFixed(1) +
                ')</p></div>' +
                ItemLabel
            );
        }

        SetQualityBar(newDataTo, $toInv, $toSlot);

        var newDataFrom = [];
        newDataFrom.name = fromData.name;
        newDataFrom.label = fromData.label;
        newDataFrom.weight = fromData.weight;
        newDataFrom.type = fromData.type;
        newDataFrom.stackable = fromData.stackable;
        newDataFrom.useable = fromData.useable;
        newDataFrom.shouldClose = fromData.shouldClose;
        newDataFrom.combinable = fromData.combinable;
        newDataFrom.decayrate = fromData.decayrate;
        newDataFrom.image = fromData.image;
        newDataFrom.description = fromData.description;
        newDataFrom.slot = parseInt($fromSlot);
        newDataFrom.amount = parseInt(fromData.amount - $toAmount);
        newDataFrom.info = fromData.info;
        newDataFrom.quality = fromData.quality;

        $fromInv.find('[data-slot=' + $fromSlot + ']').data('item', newDataFrom);

        $fromInv.find('[data-slot=' + $fromSlot + ']').addClass('item-drag');
        $fromInv.find('[data-slot=' + $fromSlot + ']').removeClass('item-nodrag');

        if ($fromInv.attr('data-inventory').split('-')[0] == 'itemshop') {
          $fromInv
            .find('[data-slot=' + $fromSlot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                newDataFrom.image +
                '" alt="' +
                newDataFrom.name +
                '" /></div><div class="item-slot-amount"><p>(' +
                newDataFrom.amount +
                ') $' +
                newDataFrom.price +
                '</p></div><div class="item-slot-label"><p>' +
                newDataFrom.label +
                '</p></div>'
            );
        } else {
          var ItemLabel =
          '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
          newDataFrom.label +
          '</p></div>';

          if ($fromSlot < 6 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>' +
                  $fromSlot +
                  '</p></div><div class="item-slot-img"><img src="images/' +
                  newDataFrom.image +
                  '" alt="' +
                  newDataFrom.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  newDataFrom.amount +
                  ' (' +
                  ((newDataFrom.weight * newDataFrom.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          } else if ($fromSlot == 41 && $fromInv.attr('data-inventory') == 'player') {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                  newDataFrom.image +
                  '" alt="' +
                  newDataFrom.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  newDataFrom.amount +
                  ' (' +
                  ((newDataFrom.weight * newDataFrom.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          } else {
            $fromInv
              .find('[data-slot=' + $fromSlot + ']')
              .html(
                '<div class="item-slot-img"><img src="images/' +
                  newDataFrom.image +
                  '" alt="' +
                  newDataFrom.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  newDataFrom.amount +
                  ' (' +
                  ((newDataFrom.weight * newDataFrom.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          }

          SetQualityBar(newDataFrom, $fromInv, $fromSlot);
        }
        $.post('https://dg-inventory/PlayDropSound', JSON.stringify({}));
        $.post(
          'https://dg-inventory/SetInventoryData',
          JSON.stringify({
            fromInventory: $fromInv.attr('data-inventory'),
            toInventory: $toInv.attr('data-inventory'),
            fromSlot: $fromSlot,
            toSlot: $toSlot,
            fromAmount: $toAmount,
          })
        );
      } else {
        InventoryError($fromInv, $fromSlot);
      }
    }
  }
  HandleDragDrop();
}

function isItemAllowed(item, allowedItems) {
  var retval = false;
  $.each(allowedItems, function (index, i) {
    if (i == item) {
      retval = true;
    }
  });
  return retval;
}

function InventoryError($elinv, $elslot) {
  $elinv
    .find('[data-slot=' + $elslot + ']')
    .css('background', 'rgba(156, 20, 20, 0.5)')
    .css('transition', 'background 500ms');
  setTimeout(function () {
    $elinv.find('[data-slot=' + $elslot + ']').css('background', 'rgba(255, 255, 255, 0.03)');
  }, 500);
  $.post('https://dg-inventory/PlayDropFail', JSON.stringify({}));
}

var requiredItemOpen = false;

(() => {
  Inventory = {};

  Inventory.dropslots = 15;
  Inventory.droplabel = 'Drop';
  Inventory.dropmaxweight = 100000;

  Inventory.Error = function () {
    $.post('https://dg-inventory/PlayDropFail', JSON.stringify({}));
  };

  Inventory.Open = function (data) {
    totalWeight = 0;
    totalWeightOther = 0;

    $('.player-inventory').find('.item-slot').remove();

    if (requiredItemOpen) {
      $('.requiredItem-container').hide();
      requiredItemOpen = false;
    }

    $('#dg-inventory').fadeIn(300);

    if (data.other != null && data.other != '') {
      $('.other-inventory').attr('data-inventory', data.other.name);
    } else {
      $('.other-inventory').attr('data-inventory', 0);
    }

    // First 5 Slots
    for (i = 1; i <= 5; i++) {
      $('.player-inventory').append(
        '<div class="item-slot" data-slot="' +
          i +
          '"><div class="item-slot-key"><p>' +
          i +
          '</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>'
      );
    }
    // Inventory
    for (i = 6; i <= data.slots; i++) {
      $('.player-inventory').append(
        '<div class="item-slot" data-slot="' +
          i +
          '"><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>'
      );
    }

    if (data.other != null && data.other != '') {
      for (i = 1; i <= data.other.slots; i++) {
        $('.other-inventory').append(
          '<div class="item-slot" data-slot="' +
            i +
            '"><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>'
        );
      }
    } else {
      for (i = 1; i <= Inventory.dropslots; i++) {
        $('.other-inventory').append(
          '<div class="item-slot" data-slot="' +
            i +
            '"><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>'
        );
      }

      $('.other-inventory .item-slot').css({
        'background-color': 'rgba(0, 0, 0, 0.123)',
      });
    }

    if (data.inventory !== null) {
      $.each(data.inventory, function (i, item) {
        if (item != null) {
          totalWeight += item.weight * item.amount;
          var ItemLabel =
          '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
          item.label +
          '</p></div>';

          if (item.slot < 6) {
            $('.player-inventory')
              .find('[data-slot=' + item.slot + ']')
              .addClass('item-drag');
            $('.player-inventory')
              .find('[data-slot=' + item.slot + ']')
              .html(
                '<div class="item-slot-key"><p>' +
                  item.slot +
                  '</p></div><div class="item-slot-img"><img src="images/' +
                  item.image +
                  '" alt="' +
                  item.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  item.amount +
                  ' (' +
                  ((item.weight * item.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
            $('.player-inventory')
              .find('[data-slot=' + item.slot + ']')
              .data('item', item);
          } else {
            $('.player-inventory')
              .find('[data-slot=' + item.slot + ']')
              .addClass('item-drag');
            $('.player-inventory')
              .find('[data-slot=' + item.slot + ']')
              .html(
                '<div class="item-slot-img"><img src="images/' +
                  item.image +
                  '" alt="' +
                  item.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  item.amount +
                  ' (' +
                  ((item.weight * item.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
            $('.player-inventory')
              .find('[data-slot=' + item.slot + ']')
              .data('item', item);
          }

          Inventory.QualityCheck(item, false);
        }
      });
    }

    if (data.other != null && data.other != '' && data.other.inventory != null) {
      $.each(data.other.inventory, function (i, item) {
        if (item != null) {
          totalWeightOther += item.weight * item.amount;
          var ItemLabel =
          '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' +
          item.label +
          '</p></div>';

          $('.other-inventory')
            .find('[data-slot=' + item.slot + ']')
            .addClass('item-drag');

          if (item.price != null) {
            $('.other-inventory')
              .find('[data-slot=' + item.slot + ']')
              .html(
                '<div class="item-slot-img"><img src="images/' +
                  item.image +
                  '" alt="' +
                  item.name +
                  '" /></div><div class="item-slot-amount"><p>(' +
                  item.amount +
                  ') $' +
                  item.price +
                  '</p></div>' +
                  ItemLabel
              );
          } else {
            $('.other-inventory')
              .find('[data-slot=' + item.slot + ']')
              .html(
                '<div class="item-slot-img"><img src="images/' +
                  item.image +
                  '" alt="' +
                  item.name +
                  '" /></div><div class="item-slot-amount"><p>' +
                  item.amount +
                  ' (' +
                  ((item.weight * item.amount) / 1000).toFixed(1) +
                  ')</p></div>' +
                  ItemLabel
              );
          }

          $('.other-inventory')
            .find('[data-slot=' + item.slot + ']')
            .data('item', item);
          Inventory.QualityCheck(item, true);
        }
      });
    }

    var per = totalWeight / 1000 / (data.maxweight / 100000);

    $('.pro').css('width', per + '%');
    $('#player-inv-weight').html(
      'Gewicht: ' + (totalWeight / 1000).toFixed(2) + ' / ' + (data.maxweight / 1000).toFixed(2) + ' kg'
    );
    playerMaxWeight = data.maxweight;

    if (data.other != null) {
      var name = data.other.name.toString();

      if (name != null && (name.split('-')[0] == 'itemshop' || name == 'crafting')) {
        $('#other-inv-label').html(data.other.label);
      } else {
        $('#other-inv-label').html(data.other.label);
        $('#other-inv-weight').html(
          'Gewicht: ' + (totalWeightOther / 1000).toFixed(2) + ' / ' + (data.other.maxweight / 1000).toFixed(2) + ' kg'
        );
        var per12 = totalWeightOther / 1000 / (data.other.maxweight / 100000);
        $('.pro1').css('width', per12 + '%');
      }

      otherMaxWeight = data.other.maxweight;
      otherLabel = data.other.label;
    } else {
      $('#other-inv-label').html(Inventory.droplabel);
      $('#other-inv-weight').html(
        'Gewicht: ' + (totalWeightOther / 1000).toFixed(2) + ' / ' + (Inventory.dropmaxweight / 1000).toFixed(2) + ' kg'
      );
      var per123 = totalWeightOther / 1000 / (Inventory.dropmaxweight / 100000);
      $('.pro1').css('width', per123 + '%');
      otherMaxWeight = Inventory.dropmaxweight;
      otherLabel = Inventory.droplabel;
    }

    $.each(data.maxammo, function (index, ammotype) {
      $('#' + index + '_ammo')
        .find('.ammo-box-amount')
        .css({ height: '0%' });
    });

    if (data.Ammo !== null) {
      $.each(data.Ammo, function (i, amount) {
        var Handler = i.split('_');
        var Type = Handler[1].toLowerCase();
        if (amount > data.maxammo[Type]) {
          amount = data.maxammo[Type];
        }
        var Percentage = (amount / data.maxammo[Type]) * 100;

        $('#' + Type + '_ammo')
          .find('.ammo-box-amount')
          .css({ height: Percentage + '%' });
        $('#' + Type + '_ammo')
          .find('span')
          .html(amount + 'x');
      });
    }

    $('#item-amount').focus();
    HandleDragDrop();
  };

  Inventory.QualityCheck = function (item, IsOtherInventory) {
    if (item.quality == undefined) {
      item.quality = 100;
    }
    var QualityColor = 'rgb(39, 174, 96)';
    if (item.quality < 25) {
      QualityColor = 'rgb(192, 57, 43)';
    } else if (item.quality > 25 && item.quality < 50) {
      QualityColor = 'rgb(230, 126, 34)';
    } else if (item.quality >= 50) {
      QualityColor = 'rgb(39, 174, 96)';
    }
    if (item.quality !== undefined) {
      qualityLabel = item.quality.toFixed();
    } else {
      qualityLabel = item.quality;
    }
    if (item.quality == 0) {
      qualityLabel = 'BROKEN';
      if (!IsOtherInventory) {
        $('.player-inventory')
          .find('[data-slot=' + item.slot + ']')
          .find('.item-slot-quality-bar')
          .css({
            width: '100%',
            'background-color': QualityColor,
          })
          .find('p')
          .html(qualityLabel);
      } else {
        $('.other-inventory')
          .find('[data-slot=' + item.slot + ']')
          .find('.item-slot-quality-bar')
          .css({
            width: '100%',
            'background-color': QualityColor,
          })
          .find('p')
          .html(qualityLabel);
      }
    } else {
      if (!IsOtherInventory) {
        $('.player-inventory')
          .find('[data-slot=' + item.slot + ']')
          .find('.item-slot-quality-bar')
          .css({
            width: qualityLabel + '%',
            'background-color': QualityColor,
          })
          .find('p')
          .html(qualityLabel);
      } else {
        $('.other-inventory')
          .find('[data-slot=' + item.slot + ']')
          .find('.item-slot-quality-bar')
          .css({
            width: qualityLabel + '%',
            'background-color': QualityColor,
          })
          .find('p')
          .html(qualityLabel);
      }
    }
  };

  Inventory.Close = function () {
    $('.item-slot').css('border', '1px solid rgba(255, 255, 255, 0.1)');
    $('.ply-iteminfo-container').css('display', 'none');
    $('#dg-inventory').fadeOut(300);
    $('.combine-option-container').hide();
    $('.item-slot').remove();
    $.post('https://dg-inventory/CloseInventory', JSON.stringify({}));
  };

  Inventory.Update = function (data) {
    totalWeight = 0;
    totalWeightOther = 0;
    $('.player-inventory').find('.item-slot').remove();
    if (data.error) {
      Inventory.Error();
    }
    for (i = 1; i < data.slots + 1; i++) {
      if (i == 41) {
        $('.player-inventory').append(
          '<div class="item-slot" data-slot="' +
            i +
            '"><div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>'
        );
      } else {
        $('.player-inventory').append(
          '<div class="item-slot" data-slot="' +
            i +
            '"><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>'
        );
      }
    }

    $.each(data.inventory, function (i, item) {
      if (item != null) {
        totalWeight += item.weight * item.amount;
        if (item.slot < 6) {
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .addClass('item-drag');
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .html(
              '<div class="item-slot-key"><p>' +
                item.slot +
                '</p></div><div class="item-slot-img"><img src="images/' +
                item.image +
                '" alt="' +
                item.name +
                '" /></div><div class="item-slot-amount"><p>' +
                item.amount +
                ' (' +
                ((item.weight * item.amount) / 1000).toFixed(1) +
                ')</p></div><div class="item-slot-label"><p>' +
                item.label +
                '</p></div>'
            );
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .data('item', item);
        } else if (item.slot == 41) {
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .addClass('item-drag');
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .html(
              '<div class="item-slot-key"><p>6 <i class="fas fa-lock"></i></p></div><div class="item-slot-img"><img src="images/' +
                item.image +
                '" alt="' +
                item.name +
                '" /></div><div class="item-slot-amount"><p>' +
                item.amount +
                ' (' +
                ((item.weight * item.amount) / 1000).toFixed(1) +
                ')</p></div><div class="item-slot-label"><p>' +
                item.label +
                '</p></div>'
            );
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .data('item', item);
        } else {
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .addClass('item-drag');
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .html(
              '<div class="item-slot-img"><img src="images/' +
                item.image +
                '" alt="' +
                item.name +
                '" /></div><div class="item-slot-amount"><p>' +
                item.amount +
                ' (' +
                ((item.weight * item.amount) / 1000).toFixed(1) +
                ')</p></div><div class="item-slot-label"><p>' +
                item.label +
                '</p></div>'
            );
          $('.player-inventory')
            .find('[data-slot=' + item.slot + ']')
            .data('item', item);
        }
      }
    });
    var per = totalWeight / 1000 / (data.maxweight / 100000);
    $('.pro').css('width', per + '%');
    $('#player-inv-weight').html(
      'Gewicht: ' + (totalWeight / 1000).toFixed(2) + ' / ' + (data.maxweight / 1000).toFixed(2) + ' kg'
    );

    $('#item-amount').focus();
    HandleDragDrop();
  };

  Inventory.UseItem = function (data) {
    $('.itembox-container').hide();
    $('.itembox-container').fadeIn(250);
    $('#itembox-label').html('<p>' + data.item.label + '</p>');
    $('#itembox-image').html(
      '<div class="item-slot-img"><img src="images/' + data.item.image + '" alt="' + data.item.name + '" /></div>'
    );
    setTimeout(function () {
      $('.itembox-container').fadeOut(250);
    }, 2000);
  };

  var itemBoxtimer = null;
  var requiredTimeout = null;

  Inventory.itemBox = function (data) {
    if (itemBoxtimer !== null) {
      clearTimeout(itemBoxtimer);
    }

    var type = 'Used';

    if (data.type == 'add') {
      type = 'Ontvangen';
    } else if (data.type == 'holster') {
      type = 'Weggestoken';
    } else if (data.type == 'unholster') {
      type = 'Genomen';
    } else if (data.type == 'remove') {
      type = 'Verwijderd';
    }

    var $itembox = $('.itembox-container.template').clone();
    $itembox.removeClass('template');
    $itembox.html(
      '<div id="itembox-action"><p>' +
        type +
        '</p></div><div id="itembox-label"><p>' +
        data.item.label +
        '</p></div><div class="item-slot-img"><img src="images/' +
        data.item.image +
        '" alt="' +
        data.item.name +
        '" /></div>'
    );
    $('.itemboxes-container').prepend($itembox);
    $itembox.fadeIn(250);

    setTimeout(function () {
      $.when($itembox.fadeOut(300)).done(function () {
        $itembox.remove();
      });
    }, 3000);
  };

  Inventory.RequiredItem = function (data) {
    if (requiredTimeout !== null) {
      clearTimeout(requiredTimeout);
    }
    if (data.toggle) {
      if (!requiredItemOpen) {
        $('.requiredItem-container').html('');
        $.each(data.items, function (index, item) {
          var element =
            '<div class="requiredItem-box"><div id="requiredItem-action">Required</div><div id="requiredItem-label"><p>' +
            item.label +
            '</p></div><div id="requiredItem-image"><div class="item-slot-img"><img src="images/' +
            item.image +
            '" alt="' +
            item.name +
            '" /></div></div></div>';
          $('.requiredItem-container').hide();
          $('.requiredItem-container').append(element);
          $('.requiredItem-container').fadeIn(100);
        });
        requiredItemOpen = true;
      }
    } else {
      $('.requiredItem-container').fadeOut(100);
      requiredTimeout = setTimeout(function () {
        $('.requiredItem-container').html('');
        requiredItemOpen = false;
      }, 100);
    }
  };

  window.onload = function () {
    window.addEventListener('message', function (event) {
      switch (event.data.action) {
        case 'open':
          Inventory.Open(event.data);
          break;
        case 'close':
          Inventory.Close();
          break;
        case 'update':
          Inventory.Update(event.data);
          break;
        case 'itemBox':
          Inventory.itemBox(event.data);
          break;
        case 'requiredItem':
          Inventory.RequiredItem(event.data);
          break;
      }
    });
  };
})();
