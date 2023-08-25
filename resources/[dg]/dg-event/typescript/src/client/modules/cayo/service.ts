import { Thread } from '@dgx/shared';
import { ISLAND_COORDS, ISLAND_IPLS, STATIC_EMITTERS } from './constant';
import { Util } from '@dgx/client';

let radarThread = new Thread(
  () => {
    SetRadarAsExteriorThisFrame();
    SetRadarAsInteriorThisFrame(GetHashKey('h4_fake_islandx'), 4700.0, -5145.0, 0, 0);
  },
  0,
  'tick'
);
let transitionThread = new Thread(
  () => {
    let plyCoords = Util.getPlyCoords();
    if (plyCoords.distance(ISLAND_COORDS) < 2000 && !transitionThread.data.islandActive) {
      onLoad();
      transitionThread.data.islandActive = true;
    } else if (plyCoords.distance(ISLAND_COORDS) > 2000 && transitionThread.data.islandActive) {
      onCleanup();
      transitionThread.data.islandActive = false;
    }
  },
  1000,
  'interval'
);

transitionThread.data.islandActive = false;
transitionThread.addHook('afterStop', () => {
  onCleanup();
  transitionThread.data.islandActive = false;
});

export const toggleTransition = (toggle: boolean) => {
  if (toggle) {
    transitionThread.start();
  } else {
    transitionThread.stop();
  }
};

const onLoad = () => {
  STATIC_EMITTERS.forEach(emitter => {
    SetStaticEmitterEnabled(emitter, false);
  });

  toggleIpls(true);
  SetIslandHopperEnabled('HeistIsland', true);
  SetAiGlobalPathNodesType(1);
  SetToggleMinimapHeistIsland(true);
  LoadGlobalWaterType(1);
  SetDeepOceanScaler(0.0);

  radarThread.start();
};

const onCleanup = () => {
  toggleIpls(false);
  SetIslandHopperEnabled('HeistIsland', false);
  SetAiGlobalPathNodesType(0);
  SetToggleMinimapHeistIsland(false);
  LoadGlobalWaterType(0);
  SetDeepOceanScaler(1.0);

  radarThread.stop();
};

const toggleIpls = (toggle: boolean) => {
  ISLAND_IPLS.forEach(ipl => {
    if (toggle) {
      RequestIpl(ipl);
    } else {
      RemoveIpl(ipl);
    }
  });
};
