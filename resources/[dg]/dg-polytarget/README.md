# dg-polytarget

Dit script is een copy van de polyzone wrapper maar voor peek targets. Het heeft volgende exports dat overeenkomen met
de polyzone targets:

- AddBoxTarget
- AddCircleTarget
- AddPolyTarget
- getTargetZones
- removeTargetZone (removes all zones with this name)

## Important
When building polyzones in core:characters:unloaded event, make sure to provide routingBucket as the current player bucket will get used which is not always the default (0)!