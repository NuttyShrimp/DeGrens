import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './TwitterApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'twitter',
	label: 'Twitter',
	icon: {
		name: 'twitter',
		lib: 'fab fa-',
		color: '#1DA1F2',
		background: '#282828',
	},
	position: 8,
	render: mainComponent,
	events,
});

export default config;
