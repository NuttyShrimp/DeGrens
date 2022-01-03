import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './GalleryApp.vue';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'gallery',
	label: 'Gallery',
	icon: {
		name: 'images',
		color: 'white',
		background: '#155312',
	},
	position: 12,
	render: mainComponent,
});

export default config;
