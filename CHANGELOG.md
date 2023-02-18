# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1]

### Added

- Als je eten/drinken stats zeer laag staan zal een revive bij de hospital je een beetje bijgeven zodat je verder kan
- PMA-sirensync
- Trashinventory optie in adminpanel
- Blips voor restaurants
- Notification to indicate rental papers should be used to get keys
- Admin clear vehicle service optie
- Non-scuffed inbeslagname optie toegevoegd
- phone en laptop toegevoegd aan hardware store
- Salesticket bij uitvoeren van towingjob
- Smoll staffchat toegevoegd
- Andere kleur naam in admin blips als speler praat
- Commands om masker/bril/helm uit te zetten
- Failsafe in shops waardoor non-existing items nie alles breekt
- Huisoverval locaties toegevoegd

### Changed

- Removed sentry transaction in UI event
- Ontbrekende items toegevoegd aan politie/ambu safe
- Tijdelijk drugslabs uitgezet
- Reset voertuig stalls bij gebruik van repairkit
- Send plyInfo als een ander key voor minder data te moeten extracten
- Eten/drank afnemen verminderd
- Fietsen zijn goedkoop gemaakt, andere voertuigen volgen soon
- Fuel goedkoper gemaakt
- Lockpicks goedkoper en gaan langer mee
- Goedkopere seeds en meer loot per farming plant
- Goedkopere bennys reparages 
- Minder stress gain door speed
- Je krijgt betaald volgens payout level in het begin van je job
- Ook een waypoint naar getracked voertuig met langere blip
- Enkel weedlab aangezet
- Forceer in-voertuig-plaatsen op achterse seat bij motor

### Fixed

- Garage zones groter gemaakt op sommige plaatsen waar je soms de parking spot niet kon zien
- LOD van golf van lokale politie aangepast
- Mogelijkheid om te praten in hospitaalbed
- Mogelijkheid om te praten terwijl je gecarried wordt
- Custom clothing is nu voor zowel man als vrouw beschikbaar
- Clothing outfits gefixed
- Je kunt nu je paycheck gaan ophalen in de pacific
- De politie voertuigen hebben minder wheelspin
- De ambulance sprinter heeft een treffelijk handling
- Verwijderd key requirement voor mechanics options
- Verlaagt min percentage van vehicle damage service
- Fix errors bij proberen kopen van items wanneer je niet genoeg geld hebt
- Testdrive inleveren geeft je geld weer terug
- Fix tijd die niet naar nieuwe dag ging
- Remove sync:getlogs log

## [0.0.0]

Initial release