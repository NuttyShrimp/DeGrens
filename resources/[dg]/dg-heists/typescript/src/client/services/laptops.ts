import { Animations, Events, Minigames, Phone, Util } from '@dgx/client';

Events.onNet(
  'heists:laptops:startHack',
  async (location: Vec4, laptopConfig: Heists.Laptops.Config['laptops'][string]) => {
    await Util.goToCoords(location);

    const hackSuccess = await Animations.doLaptopHackAnimation(() =>
      Minigames.visiongame(laptopConfig.gridSize, laptopConfig.time)
    );
    if (hackSuccess) {
      Phone.addMail({
        subject: 'Openen Deur',
        sender: 'Hackermans',
        message: 'Ik doe er alles aan om zo snel mogelijk de deur te laten opengaan.',
      });
    }

    Events.emitNet('heists:laptops:finishHack', hackSuccess);
  }
);
