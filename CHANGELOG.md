# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Sloten op deuren/poorten van Low Santos toegevoegd
- Log toegevoegd wanneer speler server leavet terwijl hij dood/bewusteloos is
- Justice on-duty zones added

### Changed

- Tweak nog wat inventory logger prints
- Voertuig prijzen voor klasse B,C,D aangepast
- Vereiste rechten van resetplayerprops veranderd naar staff

### Fixed

- Ambu voertuigen staan nu met juiste spawnnaam in config
- Fix sommige walkstyles met invalid icon waardoor menu niet geladen werd
- Nu actually de metadata van salestickets hiden
- Swapped names for jobs in justice app
- Je moet je UI niet meer opnieuw opstarten na het accepteren van een phone notificatie / UI focus verdwijnt niet als er nog interactive apps openstaan
- Admin names van personen in een voertuig overlappen niet meer
- Fix falsepositive speedban en damagemultiplier
- Enkele voertuigen geblacklist
- PostOP skip staat nu wel op het voertuig ipv signin persoon
- Fix dupe bug bij looten van radiotowers
- Voertuigen zouden niet meer random mogen verdwijnen Prayge

## [1.0.3]

### Added

- Houserobbery timeout per persoon geadd
- Admin kick from vehicle optie toegevoegd
- Skip locatie optie voor postop
- Admin neem screenshot optie
- Je ziet nu info van het huidige voertuig in PDM
- Vehicle maintenance fees

### Changed

- Reduced crypto coin prices
- Console spam van inventory logs verminderd
- Je hoeft fietsen niet langer te lockpicken
- Propattach objecten worden niet gespawned als je in noclip/cloak bent
- Ambulance checkin kan niet meer gespammed worden
- Alle payouts en decayrates aangepast
- Logs van SECRET containers aangepast
- Peek entries worden standaard gedisabled als je in een voertuig zit
- Staff kan nu zoeken op characternaam in adminmenu
- Serviceparts gaan minder snel kapot
- Je stallet minder snel met een voertuig
- Er spawnen geen random brandweerwagens meer

### Fixed

- Verwerkt ijzer foto aangepast
- Je ziet hidden metadata van salestickets niet meer
- PropAttach models worden nu pas geladen wanneer ze nodig zijn
- Armor restored nu deftig als je terug in de stad komt
- Je kan nu zelf ervoor zorgen dat iemand stop met je te carryen
- Andere mensen kunnen nu een actieve houserobbery betreden
- Fix paycheck receive notificatie
- Admins zien nu wel blipnamen van spelers die al in server waren voordat ze zelf joinede
- Logs die gebruik maaktte van export veranderd naar dgx function
- Iedereen kan nu weer kijken hoe hun serviceparts ongeveer staan
- Je stapt niet langer soms uit alsje een voertuig lockpickt
- Maintenance fees scheduling is nu werkend

## [1.0.2]

### Added

- Restaurant extra opslag, locker en kledingkast, tweaked taskbar times
- Plantvoeding heeft nu meerdere usages
- Je kan nu een huidige sanitation locatie skippen als je de vuilzak niet vindt 
- Admin kan nu een individueel bericht naar een persoon sturen
- Extra message before AC tries to ban user
- Extra bennys locaties
- Hardware store in sandy toegevoegd

### Changed

- Discord presence is aangepast
- Algemene job payout tweaks
- Lagere carwash prijs
- Inventory drop remove time verhoogt
- Laatste locatie kan gebruikt worden voor 5 minuten nadat je uitloggede
- Reputatie vereisten voor mechanics verlaagd
- Shopprijzen van sommige items verlaagt
- Gestallede motor gaat niet meer terug aan als je geen sleutels hebt
- Confirm button om restaurant order te cancelen
- Grotere scrapyard zone
- Repairparts repairen een hoger percentage wat meer gebalanceerd is
- NPCs in Up-n-Atom verwijderd omdat deze geen goede paths hadden
- Je moet niet meer in hetzelfde vak staan om je voertuig weg te steken
- Prijs van paycheck notificatie toont taxed price
- Langere decayrate voor mechanic repairparts
- Deur van hoofdingang HB verwijderd
- Auto lockpick melding lager gezet
- EMS porto gaat minder snel stuk
- Kapotte items krijgen sneller een rode background
- Hunting skinprijzen verlaagd omdat meeste mensen geen bait gebruiken

### Fixed

- Confisqueren van items is niet meer mogelijk bij medeagent
- Farming items gaan niet meer onder nul quality
- Restaurant medewerker gaat nu automatisch uit dienst als deze de server verlaat
- Extra controle op samen materiaal uit smeltoven nemen
- Check garage access op whitelist en niet op active job
- Je correct emmer wordt nu gebruikt beinvloed bij het water geven van een plant
- Geld in info app afronden voor komma getal verbergen
- Tijdelijk disabled dat stalling de voertuigservice beinvloed tot ik service heb gefixt
- Je stapt niet langer soms automatisch uit na het lockpicken
- Clamped vehicle service values
- Staff ziet nu playernames voor mensen ver weg
- Wagens zouden niet meer random/opeens mogen verdwijnen
- F3 suggestions bij DPEmotes weggehaald
- Admins kunnen nu wel whitelisted job geven mbv cid
- Scrapyard zone gedraait omdat deze fout stond
- Voertuig blijft niet langer kapot als je stallt zonder dat je sleutels hebt
- Interiors worden nu wel aangemaakt bij houserobbery
- SECRET Recycle ped gebruikte verkeerde stashid
- Flatbed aan vehicles toegevoegd zodat ze gemaakt kan worden

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
- Minder service decrease bij stallen van voertuig
- Meer plastic te vinden

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