import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './YellowPagesApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'yellowpages',
	label: 'Advertenties',
	icon: {
		name: 'newspaper',
		color: '#000000',
		background: '#FFC600',
	},
	position: 7,
	render: mainComponent,
	events,
});

export default config;
