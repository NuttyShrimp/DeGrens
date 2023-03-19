import { Events, Minigames, Phone, Util } from '@dgx/client';

Events.onNet(
  'heists:laptops:startHack',
  async (location: Vec4, laptopConfig: Heists.Laptops.Config['laptops'][string]) => {
    const ped = PlayerPedId();
    await Util.goToCoords({ ...Util.getEntityCoords(ped), w: location.w });

    const plyCoords = Util.getEntityCoords(ped);
    const plyRot = Util.getEntityRotation(ped);

    const animDict = 'anim@heists@ornate_bank@hack';
    await Util.loadAnimDict(animDict);

    const { entity: laptopObject } = await Util.createObjectOnServer('hei_prop_hst_laptop', plyCoords);
    if (!laptopObject || !DoesEntityExist(laptopObject)) return;

    let animScene = NetworkCreateSynchronisedScene(
      location.x,
      location.y,
      location.z,
      plyRot.x,
      plyRot.y,
      plyRot.z,
      2,
      false,
      false,
      1065353216,
      0.7,
      1.0
    );
    NetworkAddPedToSynchronisedScene(ped, animScene, animDict, 'hack_enter', 1.5, -4.0, 1, 16, 1148846080, 0);
    NetworkAddEntityToSynchronisedScene(laptopObject, animScene, animDict, 'hack_loop_laptop', 4.0, -8.0, 1);
    NetworkStartSynchronisedScene(animScene);
    await Util.Delay(1800);

    // anim part 2 and hacking logic
    animScene = NetworkCreateSynchronisedScene(
      location.x,
      location.y,
      location.z,
      plyRot.x,
      plyRot.y,
      plyRot.z,
      2,
      false,
      true,
      1065353216,
      0,
      1.3
    );
    NetworkAddPedToSynchronisedScene(ped, animScene, animDict, 'hack_loop', 1.3, -4.0, 1, 16, 1148846080, 0);
    NetworkAddEntityToSynchronisedScene(laptopObject, animScene, animDict, 'hack_loop_laptop', 4.0, -8.0, 1);
    NetworkStartSynchronisedScene(animScene);
    await Util.Delay(2000);

    const hackSuccess = await Minigames.visiongame(laptopConfig.gridSize, laptopConfig.time);
    Events.emitNet('heists:laptops:finishHack', hackSuccess);
    if (hackSuccess) {
      Phone.sendMail('Openen Deur', 'Hackermans', 'Ik doe er alles aan om zo snel mogelijk de deur te laten opengaan.');
    }

    await Util.Delay(750);

    // anim part 3
    animScene = NetworkCreateSynchronisedScene(
      location.x,
      location.y,
      location.z,
      plyRot.x,
      plyRot.y,
      plyRot.z,
      2,
      false,
      false,
      1065353216,
      0,
      1.3
    );
    NetworkAddPedToSynchronisedScene(ped, animScene, animDict, 'hack_exit', 1.0, -1.0, 1, 16, 1148846080, 0);
    NetworkAddEntityToSynchronisedScene(laptopObject, animScene, animDict, 'hack_exit_laptop', 4.0, -8.0, 1);
    NetworkStartSynchronisedScene(animScene);
    await Util.Delay(1500);

    // cleanup
    NetworkStopSynchronisedScene(animScene);
    await Util.requestEntityControl(laptopObject);
    DeleteEntity(laptopObject);
    RemoveAnimDict(animDict);
  }
);
