import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './StateApp.vue';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'state',
	label: 'De staat',
	icon: {
		name: 'balance-scale-right',
		lib: 'far',
		color: '#dc2222',
		background: '#282828',
	},
	position: 13,
	render: mainComponent,
});

export default config;
