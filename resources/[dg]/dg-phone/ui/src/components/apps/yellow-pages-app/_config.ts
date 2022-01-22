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
		background: '#eec41d',
		backgroundGradient: '#eec41d',
	},
	position: 7,
	render: mainComponent,
	events,
});

export default config;
