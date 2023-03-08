import { Events, Inventory, Notifications, Util, Taskbar, UI } from '@dgx/server';
import { getConfig } from './config';

let recipes: Materials.Melting.Config['recipes'] = [];

let activeItem: (Materials.Melting.RecipeItem & { isReady: boolean }) | null = null;

export const loadMeltingRecipes = () => {
  recipes = getConfig().melting.recipes;
};

Events.onNet('materials:melting:showMenu', (src: number) => {
  if (activeItem !== null) {
    Notifications.add(src, 'Hier zit nog iets in', 'error');
    return;
  }

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Smelten',
      description: 'Kies het materiaal dat je wil omsmelten',
      icon: 'fire',
      disabled: true,
    },
  ];

  recipes.forEach((recipe, i) => {
    const itemInfo = Inventory.getItemData(recipe.from.name);
    menu.push({
      title: itemInfo?.label ?? 'Undefined (@Jens xx)',
      description: `Vereist: ${recipe.from.amount}`,
      callbackURL: 'materials/melting/select',
      data: {
        recipeId: i,
      },
    });
  });

  UI.openContextMenu(src, menu);
});

Events.onNet('materials:melting:melt', async (src: number, recipeId: number) => {
  if (activeItem !== null) {
    Notifications.add(src, 'Hier zit nog iets in', 'error');
    return;
  }

  const choosenRecipe = recipes[recipeId];
  const amountPlyHas = await Inventory.getAmountPlayerHas(src, choosenRecipe.from.name);
  if (amountPlyHas < choosenRecipe.from.amount) {
    Notifications.add(src, 'Je hebt niet genoeg om te smelten', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'fire', 'Insteken', 3000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  if (activeItem !== null) {
    Notifications.add(src, 'Hier zit nog iets in', 'error');
    return;
  }

  const removeSuccessful = await Inventory.removeItemByNameFromPlayer(
    src,
    choosenRecipe.from.name,
    choosenRecipe.from.amount
  );
  if (!removeSuccessful) {
    Notifications.add(src, 'Je mist iets om te smelten', 'error');
    return;
  }

  Notifications.add(src, 'Wacht tot het materiaal is gesmolten');
  activeItem = { ...choosenRecipe.to, isReady: false };
  setTimeout(() => {
    if (activeItem === null) return;
    activeItem.isReady = true;
  }, getConfig().melting.meltingTime * 1000);

  Util.Log(
    'materials:melting:putIn',
    { ...choosenRecipe },
    `${Util.getName(src)} put in ${choosenRecipe.from.amount}x ${choosenRecipe.from.name}`,
    src
  );
});

Events.onNet('materials:melting:take', async (src: number) => {
  if (activeItem === null) {
    Notifications.add(src, 'Hier zit niks in', 'error');
    return;
  }
  if (!activeItem.isReady) {
    Notifications.add(src, 'Dit is nog niet gesmolten', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'fire', 'Uithalen', 3000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;
  if (activeItem === null) {
    Notifications.add(src, 'Hier zit niks in', 'error');
    return;
  }

  Inventory.addItemToPlayer(src, activeItem.name, activeItem.amount);
  Util.Log(
    'materials:melting:takeOut',
    { ...activeItem },
    `${Util.getName(src)} took out ${activeItem.amount}x ${activeItem.name}`,
    src
  );
  activeItem = null;
});