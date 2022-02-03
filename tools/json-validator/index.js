let finder = require('findit')('../../resources');
let jsonlint = require("jsonlint");

finder.on('file', file=>{
	// do not include files in node_modules
	if (file.indexOf('node_modules') !== -1) return
	if(file.match(/\.json$/)){
		console.log(file);
		try {
			require(file);
		} catch (e) {
			// remove stack trace from error
			throw new Error('Error in ' + file + ': ' + e.message.split('\n')[0]);
		}
	}
})