const path = require('path');

const basePaths = {
	// Source files
	src: path.resolve(__dirname, '../src'),

	// Production build files
	build: path.resolve(__dirname, '../../'),
};
const clientPaths = Object.entries(basePaths).reduce((acc, [key, value]) => {
	acc[key] = path.resolve(value, 'client');
	return acc;
}, {});
const serverPaths = Object.entries(basePaths).reduce((acc, [key, value]) => {
	acc[key] = path.resolve(value, 'server');
	return acc;
}, {});

module.exports = {
	paths: {
		client: clientPaths,
		server: serverPaths,
	},
};
