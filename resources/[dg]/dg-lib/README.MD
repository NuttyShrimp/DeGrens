# DG-lib

A collection of small scripts that are not worth it put in a separate resource

## Interaction (client)
A simple text box with text displayed at the right of your screen
Open & closing goes via exports:
```lua
-- Opening the interaction
-- type is optional, defaults to "info", can be "error" or "success"
exports["dg-lib"]:openInteraction(yourText, type)

-- closing the interaction
exports["dg-lib"]:hideInteraction()
```

## Keybinds (client)
Om de hoeveelheid loops te verminderen proberen we zoveel mogelijk keybindings vast te hangen aan custom keybindings. Er is een wrapper geschreven waarmee we ook o.a. een event triggeren mocht een geregistreerd command worden ingedrukt
Het zetten en ophalen van keybinding gebeurt via exports waardoor de lua & JS/TS gebruiksmanier dezelfde is.
### registerKeyMapping
Hiermeer kunnen we een nieuwe keybinding registeren
#### Params
- name, De naam van de keybinding die wordt meegegeven met ons event. Dit zal **NIET** de naam zijn die de spelers te zien krijgen in hun settings
- description, De kort beschrijving van de keybind. Dit zal de tekst zijn die de spelers zien in hun settings.
- onKeyDownCommand, De naam van de command dat uitgevoerd moet worden als de knop ingedruk wordt.
- onKeyUpCommand, De naam van de command dat uitgevoerd moet worden als de knop los gelaten wordt.
- default, De standaard knop die aan de keybind gegeven moet worden. Deze kan ook leegegelaten worden.
- event, De boolean die bepaald of het `dg-lib:keyEvent` event aangeroepen moet worden bij keyUp & keyDown
- type, De controller type waarvoor de key moet geregistreerd worden. Standaard is deze het keyboard
### GetCurrentKeyMap
Hiermee kunnen we de huidige geassignde key ophalen voor een custom command.
#### Params
- keycommand, de naam van de onKeyDown command
- keycontroller, de integer van de controller volgens de [fivem docs](https://docs.fivem.net/docs/game-references/input-mapper-parameter-ids/) de bovenste van deze lijst kan beschouwd worden als 1 standaard is deze 2 oftewel het keyboard
### General Use keybind
Standaard wordt er door het library script al een General Use keybind gemaakt. Je kunt deze keybind zien als een interact knop van andere games. Om op te halen of een speler op deze knop heeft gedruk maken we gebruik van ons event. Hieronder een voorbeeld
```typescript
on('dg-lib:keyEvent', (name:string, isDown: boolean)=>{
	if (!isDown) return; // Zorgt ervoor dat onderstaande code alleen wordt uitgevoerd als de knop is ingedrukt
	if (name !== "GeneralUse") return; // De code hieronder zou nu enkele uitgevoerd worden als de gebruiker op E duwt
	...
})
```

## Instances (server)

De instance module is een manager voor routingbuckets. Je kunt bijhouden welke spelers in welke routingbucket zit (als
je ze via deze manager laat joinen toch). En je kunt een aparte bucket een specifieke naam geven om ze te kunnen
identificeren mocht dat nodig zijn

Volgende exports zijn beschikbaar voor deze module:

- setInstance(source, instanceId)
- setInstanceName(instanceId, name)
- getInstanceName(instanceId) 

Hierboven kun je instanceId ook zien als de routingbucketid.
Standaard zit iedereen in routingbucket 0.