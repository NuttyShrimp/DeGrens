# DG-Apartments

Apartment script with inviting, raiding, lockdown

## Server

### Events

```
- dg-apartments:server:enterApartment, (id: nil|number), als id nil is zal het apartment van de speler opgehaald/gecreëerd worden
- dg-apartments:server:leaveApartment, (), zal de source uit zijn huidige apartment zetten
- dg-apartments:server:toggleLockDown, (), toggled de lockdown state van de apartments, is alleen doenbaar door players met de police job & ze moeten onduty zijn
```

### Callbacks

```
- dg-apartments:server:getCurrentApartment, (), haalt het apartment id op van de huidige speler
```

## Client

### Exports

```
- isInApartment, (): boolean
```

Als een speler zich in een apartment bevindt terwijl hij dit verlaat zal het apartmentid waarin hij zich bevondt
opgeslagen worden in `metadata.inside.apartment.id`