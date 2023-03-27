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

  const amountOfStacks = Math.floor(amountPlyHas / choosenRecipe.from.amount);
  const amountToRemove = choosenRecipe.from.amount * amountOfStacks;

  const removeSuccessful = await Inventory.removeItemByNameFromPlayer(src, choosenRecipe.from.name, amountToRemove);
  if (!removeSuccessful) {
    Notifications.add(src, 'Je mist iets om te smelten', 'error');
    return;
  }

  const meltTimePerStack = getConfig().melting.meltingTime;
  const timeMultiplier = 1 - Math.min(amountOfStacks, 10) * 0.05;
  const secondsTillMelted = Math.round(meltTimePerStack * amountOfStacks * timeMultiplier);

  Notifications.add(src, `Wacht tot het materiaal is gesmolten`);
  activeItem = { name: choosenRecipe.to.name, amount: choosenRecipe.to.amount * amountOfStacks, isReady: false };

  setTimeout(() => {
    if (activeItem === null) return;
    Notifications.add(src, 'Je materiaal is gesmolten!', 'success');
    activeItem.isReady = true;
  }, secondsTillMelted * 1000);

  Util.Log(
    'materials:melting:putIn',
    { ...choosenRecipe },
    `${Util.getName(src)} put in ${amountToRemove}x ${choosenRecipe.from.name}`,
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