import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './PingerApp.vue';
import { events } from './events';
import map from '@/assets/map.png';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'pinger',
	label: 'Pinger',
	icon: {
		name: 'map-pin',
		color: 'white',
		background: '#db3f0a',
		backgroundGradient: '#DB8116',
	},
	background: {
		background: `url(${map}) no-repeat 0 0 / cover #686666`,
		backgroundBlendMode: 'multiply',
		transition: 'background-position 5s ease-in-out',
	},
	position: 5,
	render: mainComponent,
	events,
});

export default config;
