local registered = {}
local resourceStarted = GetResourceState("dg-ui") == 'started'

function RegisterUICallback(name, cb)
	local function interceptCb(data, innerCb)
		cb(data, function(result)
			if result.meta.ok then
				result.meta.message = "done"
			end
			innerCb(result)
		end)
	end
	AddEventHandler(('__dg_ui:%s'):format(name), interceptCb)
	if (resourceStarted and (GetResourceState("dg-ui") == 'started')) then
		exports["dg-ui"]:RegisterUIEvent(name)
	end

	registered[#registered + 1] = name
end

function SendUIMessage(data)
	exports["dg-ui"]:SendUIMessage(data)
end

function SendAppEvent(app, data)
	exports["dg-ui"]:SendAppEvent(app, data)
end

function SetUIFocus(hasFocus, hasCursor)
	exports["dg-ui"]:SetUIFocus(hasFocus, hasCursor)
end

function SetUIFocusCustom(hasFocus, hasCursor)
	exports["dg-ui"]:SetUIFocusCustom(hasFocus, hasCursor)
end

function openApplication(app, data, preventFocus)
	exports['dg-ui']:openApplication(app, data, preventFocus)
end

function closeApplication(app)
	exports['dg-ui']:closeApplication(app)
end

AddEventHandler("__dg_ui:Ready", function()
	for _, eventName in ipairs(registered) do
		exports["dg-ui"]:RegisterUIEvent(eventName)
	end
end)

AddEventHandler('onClientResourceStart', function(resource)
	if resource ~= 'dg-ui' then
		return
	end
	resourceStarted = true
end)

AddEventHandler('onClientResourceStop', function(resource)
	if resource ~= 'dg-ui' then
		return
	end
	resourceStarted = false
end)
