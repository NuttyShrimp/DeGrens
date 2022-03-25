var types = ['INIT_CORE', 'INIT_BEFORE_MAP_LOADED', 'MAP', 'INIT_AFTER_MAP_LOADED', 'INIT_SESSION'];

// if (!window.invokeNative){

// 	var newType = function newType(name) {
// 		return function () {
// 			return handlers.startInitFunction({ type: name });
// 		};
// 	};
// 	var newOrder = function newOrder(name, idx, count) {
// 		return function () {
// 			return handlers.startInitFunctionOrder({ type: name, order: idx, count: count });
// 		};
// 	};
// 	var newInvoke = function newInvoke(name, func, i) {
// 		return function () {
// 			handlers.initFunctionInvoked({ type: name, name: func, idx: i });
// 			handlers.initFunctionInvoked({ type: name });
// 		};
// 	};

// 	var newTypeWithOrder = function newTypeWithOrder(name, count) {
// 		return function () {
// 			newType(name)();newOrder(name, 1, count)();
// 		};
// 	};

// 	const demoFuncs = [
// 		newTypeWithOrder('MAP', 5),
// 		newInvoke('MAP', 'Roads', 1),
// 		newInvoke('MAP', 'Buildings', 2),
// 		newInvoke('MAP', 'Houses', 3),
// 		newInvoke('MAP', 'Company Buildings', 4),
// 		newInvoke('MAP', 'Cars', 5),
// 		newOrder('MAP', 2, 2),
// 		newInvoke('MAP', 'Police Stations', 1),
// 		newInvoke('MAP', 'Everything Else', 2),
// 		newTypeWithOrder('INIT_SESSION', 4),
// 		newInvoke('INIT_SESSION', 'Session', 1),
// 		newInvoke('INIT_SESSION', 'Session', 2),
// 		newInvoke('INIT_SESSION', 'Session', 3),
// 		newInvoke('INIT_SESSION', 'Session', 4),
// 	];

// 	setInterval(function(){	demoFuncs.length && demoFuncs.shift()();}, 350);
// }
