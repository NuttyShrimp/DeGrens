export const setDiscordRichPresence = () => {
  setInterval(() => {
    // This is the Application ID (Replace this with you own)
    SetDiscordAppId('744155120643866676');

    // Here you will have to put the image name for the "large" icon.
    SetDiscordRichPresenceAsset('degrens_large');

    // Here you can add hover text for the "large" icon.
    SetDiscordRichPresenceAssetText('DeGrens 2.0');

    // Here you will have to put the image name for the "small" icon.
    SetDiscordRichPresenceAssetSmall('degrens_small');

    // Here you can add hover text for the "small" icon.
    SetDiscordRichPresenceAssetSmallText('Currently being developed');

    SetRichPresence('Under development');

    // DGCore.Functions.TriggerCallback('smallresources:server:GetCurrentPlayers', function(result)
    //   SetRichPresence('Players: ' .. result .. '/64')
    // end)

    SetDiscordRichPresenceAction(0, 'Onze Discord!', 'https://discord.degrensrp.be/');
    SetDiscordRichPresenceAction(1, 'Watch us work', 'https://linktr.ee/degrensdevs');
  }, 60 * 1000);
};
