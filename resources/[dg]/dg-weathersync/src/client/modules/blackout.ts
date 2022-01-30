let blackout_active = false;

const setBlackout = () => {
	SetArtificialLightsState(blackout_active);
	SetArtificialLightsStateAffectsVehicles(false);
};

onNet('dg-weathersync:client:blackout', (state: boolean) => {
	blackout_active = state;
	setBlackout();
});

setImmediate(() => {
	setBlackout();
});
