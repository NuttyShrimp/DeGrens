loadModel = function(model) 
	RequestModel(model)
	while not HasModelLoaded(model) do 
        Citizen.Wait(10) 
    end
end