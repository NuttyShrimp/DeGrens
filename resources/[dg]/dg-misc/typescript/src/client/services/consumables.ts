import { Events, Util, Sync } from '@dgx/client';
import { FxBlackOut } from './fx';

declare type EffectName = Config.EffectConsumable['effect'];

let emotedEffect: { timer: NodeJS.Timer; type: EffectName } | undefined = undefined;

const randomDrivingActions = [7, 8, 10, 11, 32];

const activeDrugs: Record<EffectName, boolean> = {
  stress: false,
  speed: false,
  damage: false,
};

const fxState: Consumables.CState = {
  alcohol: {
    count: 0,
    thread: null,
    traits: {
      vehAction: 0,
      blackout: 0,
      puke: 0,
      stumble: 0,
    },
  },
};

const effects: Record<EffectName, (duration: number) => void> = {
  stress: () => {
    const ped = PlayerPedId();
    activeDrugs.stress = true;
    if (IsPedInAnyVehicle(ped, false)) {
      emit('animations:client:EmoteCommandStart', ['smoke3']);
    } else {
      emit('animations:client:EmoteCommandStart', ['smokeweed']);
    }
    let cycle = 0;
    emotedEffect = {
      timer: setInterval(() => {
        cycle++;
        if (cycle >= 25) {
          activeDrugs.stress = false;
          clearInterval(emotedEffect?.timer);
          return;
        }
        Events.emitNet('hud:server:changeStress', Util.getRndInteger(1, 5) * -1);
      }, 2000),
      type: 'stress',
    };
  },
  damage: async duration => {
    activeDrugs.damage = true;
    Sync.setPlayerInvincible(true);
    const ped = PlayerPedId();
    // drug_flying_base 1.0
    // or spectator8 or 6 at 0.7
    SetTimecycleModifier('drug_flying_base');
    SetPedMotionBlur(ped, true);
    await Util.Delay(duration);
    SetPedMotionBlur(ped, false);
    ClearTimecycleModifier();
    Sync.setPlayerInvincible(false);
    activeDrugs.damage = false;
  },
  speed: async duration => {
    const plyId = PlayerId();
    activeDrugs.speed = true;
    SetPedMoveRateOverride(plyId, 1.25);
    SetRunSprintMultiplierForPlayer(plyId, 1.2);
    SetTimecycleModifier('BarryFadeOut');
    SetTimecycleModifierStrength(0.4);
    SetPlayerMaxStamina(PlayerId(), 200);
    let shakeInterval = setInterval(() => {
      ShakeGameplayCam('VIBRATE_SHAKE', 0.5);
    }, 2000);
    await Util.Delay(duration);
    SetPlayerMaxStamina(PlayerId(), 100);
    SetPedMoveRateOverride(plyId, 1.0);
    SetRunSprintMultiplierForPlayer(plyId, 1);
    clearInterval(shakeInterval);
    ShakeGameplayCam('VIBRATE_SHAKE', 0.0);
    ClearTimecycleModifier();
    activeDrugs.speed = false;
  },
};

global.exports('isOnDrugs', (type?: EffectName) => {
  if (type) return activeDrugs?.[type] ?? false;
  return Object.values(activeDrugs).some(d => d);
});

on('dpemotes:emoteCancelled', () => {
  if (!emotedEffect) return;
  clearInterval(emotedEffect.timer);
  activeDrugs[emotedEffect.type] = false;
});

Events.onNet('misc:consumables:applyEffect', (effectName: EffectName, duration: number) => {
  effects[effectName](duration);
});

Events.onNet('misc:consumables:applyAlcohol', (strength: number) => {
  fxState.alcohol.count = Math.min(fxState.alcohol.count + strength, 6);
  startDrunkThread();
});

// INFO: If we ever create a seperate FX service/module, move it there
const clearDrunkThread = () => {
  if (fxState.alcohol.count !== 0) return;
  if (!fxState.alcohol.thread) return;
  clearInterval(fxState.alcohol.thread);
  fxState.alcohol.thread = null;
  fxState.alcohol.traits = {
    blackout: 0,
    puke: 0,
    stumble: 0,
    vehAction: 0,
  };
  const ped = PlayerPedId();
  ShakeGameplayCam('DRUNK_SHAKE', 0.0);
  SetPedIsDrunk(ped, false);
  SetPedMotionBlur(ped, false);
  SetPedConfigFlag(ped, 100, false);
  ResetPedMovementClipset(ped, 0.0);
};

const startDrunkThread = async () => {
  if (fxState.alcohol.thread) return;

  let ped = PlayerPedId();
  ShakeGameplayCam('DRUNK_SHAKE', Math.min(fxState.alcohol.count + 0, 3));
  await Util.loadAnimSet('move_m@drunk@slightlydrunk');
  await Util.loadAnimSet('move_m@drunk@moderatedrunk');
  await Util.loadAnimSet('move_m@drunk@verydrunk');
  SetPedMovementClipset(ped, 'move_m@drunk@slightlydrunk', 1.0);
  SetPedMotionBlur(ped, true);
  SetPedIsDrunk(ped, true);
  SetPedConfigFlag(ped, 100, true);

  let lastCount = fxState.alcohol.count;
  let countChanged = false;

  fxState.alcohol.thread = setInterval(() => {
    let curTime = GetCloudTimeAsInt();
    ped = PlayerPedId();
    if (fxState.alcohol.count <= 0) {
      fxState.alcohol.count = 0;
      clearDrunkThread();
    }
    if (lastCount !== Math.floor(fxState.alcohol.count)) {
      lastCount = Math.floor(fxState.alcohol.count);
      ShakeGameplayCam('DRUNK_SHAKE', Math.min(fxState.alcohol.count + 0, 3));
      countChanged = true;
    }
    if (countChanged) {
      if (lastCount <= 1) {
        SetPedMovementClipset(ped, 'move_m@drunk@slightlydrunk', 1.0);
      } else if (lastCount <= 2) {
        SetPedMovementClipset(ped, 'move_m@drunk@moderatedrunk', 1.0);
        fxState.alcohol.traits.vehAction = curTime + Util.getRndInteger(5, 11);
      } else if (lastCount <= 3) {
        SetPedMovementClipset(ped, 'move_m@drunk@verydrunk', 1.0);
        fxState.alcohol.traits.vehAction = curTime + Util.getRndInteger(5, 11);
        fxState.alcohol.traits.stumble = curTime + Util.getRndInteger(5, 11);
      } else {
        SetPedMovementClipset(ped, 'move_m@drunk@verydrunk', 1.0);
        fxState.alcohol.traits.puke = curTime + Util.getRndInteger(5, 11);
        fxState.alcohol.traits.blackout = curTime + Util.getRndInteger(10, 21);
        fxState.alcohol.traits.vehAction = curTime + Util.getRndInteger(5, 11);
        fxState.alcohol.traits.stumble = curTime + Util.getRndInteger(5, 11);
      }
      countChanged = false;
    }

    if (fxState.alcohol.traits.stumble && fxState.alcohol.traits.stumble < curTime) {
      SetPedToRagdoll(ped, 5000, 5000, 0, false, false, false);
      fxState.alcohol.traits.stumble = curTime + Util.getRndInteger(30, 56);
    }

    if (fxState.alcohol.traits.blackout && fxState.alcohol.traits.blackout < curTime) {
      FxBlackOut();
      fxState.alcohol.traits.blackout = curTime + Util.getRndInteger(50, 71);
    }

    if (fxState.alcohol.traits.puke && fxState.alcohol.traits.puke < curTime) {
      // TODO: do actually a synced particle thing for the puke
      // Events.emitNet('misc:fx:puke');
      fxState.alcohol.traits.puke = curTime + Util.getRndInteger(60, 106);
    }

    if (fxState.alcohol.traits.vehAction && fxState.alcohol.traits.vehAction < curTime) {
      const curVeh = GetVehiclePedIsIn(ped, false);
      if (curVeh && GetPedInVehicleSeat(curVeh, -1)) {
        if (IsPedInAnyHeli(ped)) {
          for (let i = 0; i < 500; i++) {
            SetControlNormal(0, 107, 1.0);
          }
        } else {
          TaskVehicleTempAction(
            ped,
            curVeh,
            randomDrivingActions[Util.getRndInteger(0, randomDrivingActions.length)],
            3000
          );
        }
      }
      fxState.alcohol.traits.vehAction = curTime + Util.getRndInteger(10, 25);
    }

    fxState.alcohol.count = Math.max(0, fxState.alcohol.count - 0.01); // Drunk for hella long time :)
  }, 1000);
};
