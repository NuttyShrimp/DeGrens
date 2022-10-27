import { Util, Events, RPC, Minigames } from '@dgx/client';
import { getCurrentLocation } from 'controllers/locations';
import { spawnTrolleys } from 'services/trolleys/helpers.trolley';

let hackActive = false;
Events.onNet('heists:client:startHack', async (laptopName: Laptop.Name, location: Vec4) => {
  const plyPed = PlayerPedId();
  SetEntityHeading(plyPed, location.w);
  const plyCoords = Util.Vector3ToArray(Util.getEntityCoords(plyPed)) as [number, number, number];
  const plyRot = Util.Vector3ToArray(Util.getEntityRotation(plyPed)) as [number, number, number];

  const animDict = 'anim@heists@ornate_bank@hack';
  await Util.loadAnimDict(animDict);
  const laptopHash = GetHashKey('hei_prop_hst_laptop');
  await Util.loadModel(laptopHash);
  const laptopObject = CreateObject(laptopHash, ...plyCoords, true, false, false);
  SetModelAsNoLongerNeeded(laptopHash);

  let animScene = NetworkCreateSynchronisedScene(
    location.x,
    location.y,
    location.z,
    ...plyRot,
    2,
    false,
    false,
    1065353216,
    0.7,
    1.0
  );
  NetworkAddPedToSynchronisedScene(plyPed, animScene, animDict, 'hack_enter', 1.5, -4.0, 1, 16, 1148846080, 0);
  NetworkAddEntityToSynchronisedScene(laptopObject, animScene, animDict, 'hack_loop_laptop', 4.0, -8.0, 1);
  NetworkStartSynchronisedScene(animScene);
  await Util.Delay(1800);

  // anim part 2 and hacking logic
  animScene = NetworkCreateSynchronisedScene(
    location.x,
    location.y,
    location.z,
    ...plyRot,
    2,
    false,
    true,
    1065353216,
    0,
    1.3
  );
  NetworkAddPedToSynchronisedScene(plyPed, animScene, animDict, 'hack_loop', 1.3, -4.0, 1, 16, 1148846080, 0);
  NetworkAddEntityToSynchronisedScene(laptopObject, animScene, animDict, 'hack_loop_laptop', 4.0, -8.0, 1);
  NetworkStartSynchronisedScene(animScene);
  await Util.Delay(2000);

  const hackSuccess = await Minigames.sequencegame(4, 5, 10);
  if (hackSuccess) {
    const finishedHack = await RPC.execute<boolean>('heists:server:finishHack', laptopName, getCurrentLocation());
    if (!finishedHack) return;
    global.exports['dg-phone'].sendMail(
      'Bankdeur',
      'Hackermans',
      'Ik doe er alles aan om zo snel mogelijk de deur te laten opengaan.'
    );
    spawnTrolleys(getCurrentLocation());
  }

  await Util.Delay(750);

  // anim part 3
  animScene = NetworkCreateSynchronisedScene(
    location.x,
    location.y,
    location.z,
    ...plyRot,
    2,
    false,
    false,
    1065353216,
    0,
    1.3
  );
  NetworkAddPedToSynchronisedScene(plyPed, animScene, animDict, 'hack_exit', 1.0, -1.0, 1, 16, 1148846080, 0);
  NetworkAddEntityToSynchronisedScene(laptopObject, animScene, animDict, 'hack_exit_laptop', 4.0, -8.0, 1);
  NetworkStartSynchronisedScene(animScene);
  await Util.Delay(1500);

  // cleanup
  NetworkStopSynchronisedScene(animScene);
  await Util.requestEntityControl(laptopObject);
  DeleteEntity(laptopObject);
  RemoveAnimDict(animDict);
});
