showInteraction = function(text, type)
	openApplication('interaction', {
		text = text,
		type = type or 'info'
	}, 1)
end
exports('showInteraction', showInteraction)

hideInteraction = function()
	closeApplication('interaction')
end
exports('hideInteraction', hideInteraction)