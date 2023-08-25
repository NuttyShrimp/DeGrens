import './controllers/events';

setImmediate(() => {
  SetZoneEnabled(GetZoneFromNameId('PrLog'), false);
  SetScenarioGroupEnabled('Heist_Island_Peds', true);
  SetAmbientZoneListStatePersistent('AZL_DLC_Hei4_Island_Zones', true, true);
  SetAmbientZoneListStatePersistent('AZL_DLC_Hei4_Island_Disabled_Zones', false, true);
  SetAudioFlag('DisableFlightMusic', true);
});
