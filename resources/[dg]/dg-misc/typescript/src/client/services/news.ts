import { Animations, Events, Keys, PropAttach, Weapons, UI, Util, Notifications, Peek } from '@dgx/client';

let activeItem: { itemName: string; propId: number; animLoopId?: number } | null = null;

let newsCamEnabled = false;
let newsCamText = '';

const NEWS_ITEMS: Record<
  string,
  {
    animation?: {
      dict: string;
      name: string;
      flag: number;
    };
  }
> = {
  news_microphone: {},
  news_boommic: {
    animation: {
      dict: 'missfra1',
      name: 'mcs2_crew_idle_m_boom',
      flag: 50,
    },
  },
  news_camera: {
    animation: {
      dict: 'missfinale_c2mcs_1',
      name: 'fin_c2_mcs_1_camman',
      flag: 50,
    },
  },
};

Events.onNet('misc:news:toggleItem', async (itemName: string | undefined) => {
  if (activeItem !== null) {
    PropAttach.remove(activeItem.propId);
    if (activeItem.animLoopId) {
      Animations.stopAnimLoop(activeItem.animLoopId);
    }

    activeItem = null;

    handleUIInteraction();
    return;
  }

  if (!itemName) return;

  const newsItem = NEWS_ITEMS[itemName];
  if (!newsItem) return;

  Weapons.removeWeapon(undefined, true);

  const propId = PropAttach.add(itemName);

  let animLoopId: number | undefined;
  if (newsItem.animation) {
    animLoopId = Animations.startAnimLoop({
      animation: newsItem.animation,
      weight: 10,
      disableFiring: true,
      disabledControls: [23, 25, 44], // 23: enter veh, 25: aim, 44: take cover
    });
  }

  activeItem = { propId, itemName, animLoopId };

  handleUIInteraction();
});

Keys.onPressDown(
  'GeneralUse',
  () => {
    if (newsCamEnabled) {
      changeNewsText();
      return;
    }

    if (activeItem?.itemName === 'news_camera') {
      enableNewsCamera();
    }
  },
  true
);

const handleUIInteraction = () => {
  if (activeItem?.itemName === 'news_camera') {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Bekijk Camera`);
  } else {
    UI.hideInteraction();
  }
};

const enableNewsCamera = async () => {
  newsCamEnabled = true;
  UI.hideInteraction();

  Notifications.add('E - Veranderd text');

  SetTimecycleModifier('default');
  SetTimecycleModifierStrength(0.3);

  // load required scaleforms
  const scaleform = RequestScaleformMovie('breaking_news');
  await Util.awaitCondition(() => HasScaleformMovieLoaded(scaleform));

  BeginScaleformMovieMethod(scaleform, 'breaking_news');
  EndScaleformMovieMethod();

  const interval = setInterval(() => {
    DrawScaleformMovie(scaleform, 0.5, 0.63, 1.0, 1.0, 255, 255, 255, 255, 0);

    // text drawing
    SetTextColour(255, 255, 255, 255);
    SetTextFont(8);
    SetTextScale(1.0, 1.0);
    SetTextWrap(0.0, 1.0);
    SetTextCentre(false);
    SetTextDropshadow(0, 0, 0, 0, 255);
    SetTextEdge(1, 0, 0, 0, 205);
    BeginTextCommandDisplayText('STRING');
    AddTextComponentSubstringPlayerName(newsCamText || 'Breaking News');
    DrawText(0.2, 0.855);
  }, 1);

  await Util.startFirstPersonCam();

  newsCamEnabled = false;
  clearInterval(interval);
  ClearTimecycleModifier();
  handleUIInteraction();
};

const changeNewsText = async () => {
  const result = await UI.openInput<{ subject: string }>({
    header: 'Veranderd Onderwerp',
    inputs: [
      {
        name: 'subject',
        type: 'text',
        label: 'Onderwerp',
      },
    ],
  });

  if (!result.accepted) return;

  newsCamText = result.values.subject.slice(0, 22); // 22 is max characters that fit
};

Events.onNet('misc:news:lightPlaceAnim', async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('anim@heists@narcotics@trash');
  TaskPlayAnim(ped, 'anim@heists@narcotics@trash', 'drop_front', 8.0, 8.0, 800, 17, 1, false, false, false);
});

Peek.addFlagEntry('isNewsLight', {
  options: [
    {
      label: 'Neem',
      icon: 'fas fa-lightbulb',
      action: (_, entity) => {
        if (!entity) return;

        const syncedObjectId = Entity(entity).state.objId;
        if (!syncedObjectId) return;

        Events.emitNet('misc:news:takeLight', syncedObjectId);
      },
    },
  ],
});
