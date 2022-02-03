import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './StateApp.vue';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'state',
	label: 'De staat',
	icon: {
		name: 'balance-scale-right',
		lib: 'far fa-',
		color: '#dc2222',
		background: '#282828',
		size: 1.5,
	},
	position: 13,
	render: mainComponent,
});

export default config;
