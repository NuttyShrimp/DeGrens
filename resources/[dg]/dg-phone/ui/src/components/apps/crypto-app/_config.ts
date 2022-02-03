import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainContainer from './CryptoApp.vue';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'crypto',
	label: 'Crypto',
	icon: {
		name: 'icons/crypto.svg',
		lib: 'img:',
		color: 'white',
		background: '#282828',
	},
	render: mainContainer,
	position: 10,
});

export default config;
