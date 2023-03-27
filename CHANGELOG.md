# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed
- Je kan weer vissen nadat je een vis hebt gevangen
- PDM medewerkers kunnen nu wel voertuigen verkopen met lage klasse zonder ze opnieuw te moeten selecteren

## [1.1.1]

### Added
- Leefloon toegevoegd
- Gemeentehuis is nu zichtbaar op je map
- Heel wat nieuwe garages toegevoegd
- PDM medewerker wordt nu betaald als hij een voertuig verkoopt
- Nieuwe tankstation & carwash locaties toegevoegd
- Enkele nieuwe politie kledingstukken toegevoegd
- Je kan lockers nu doorgeven
- Je kan lockers nu voor korte tijd accessen nadat je het passwoord invuld
- Veel liften voor hoge gebouwen toegevoegd
- Extra banreden toegevoegd in adminpanel
- Politie signin locaties toegevoegd in Sandy/Paleto
- Schotmeldingen toegevoegd
- Wrapper toegevoegd voor geloopte animaties zodat deze elkaar niet onderbreken
- Placeable synced objects toegevoegd

### Changed
- Meer feedback bij start van fleecaoverval
- Enkele decayrates en prijzen van shopitems aangepast
- Crafting level systeem herwerkt voor sommige type benches
- Verlaag koper aantal minigame cycles
- Fleeca loot tweaked
- PostOP aflever taskbar time verlaagd
- Enkele changes aan sanddigging om aangenamer te maken
- Gang exports veranderd naar enkel name om geen promise te returnen
- Politie kan weedplanten nu sneller kapotmaken
- Gordels zijn consistenter
- Health decrease van bloed verlaagd
- Je kan geen autos zonder medewerker mee kopen als er een medewerker in de winkel is
- StaticObjects systeem herschrijven naar een chunk-based systeem
- Moved winston logger logic/creation to a seperate package to reduce code duplication

### Fixed
- Fix group job change export name
- Fix container die onder water zat
- Fix electronica lootplek dat overlapt met andere peekoption
- Je kan niet langer een voertuig lockpicken als je niet als driver zit
- Je kan geen geld witwassen tijdens cornersell als er geen agenten zijn
- Je kan nu advanced parts in een materiaalcontainer steken
- Vegetable container is nu buyable
- Phone notificatie keybinds werken nu wel
- Fix  hoge resource usage wanneer je wapen vasthebt
- Paychecks worden nu wel opgeslagen
- Reset local itemcache na characterswitch
- Je kan sneller bennys repair gebruiken
- Je kan testrit wagen nu inleveren alsje game gecrashed was

## [1.1.0]

### Added
- Phone app payout level heeft nu wel effect bij sanddigging
- Pistol flashlight voor politie toegevoegd
- Admin penalise optie via selector
- Animatie en object toegevoegd aan radio gebruik
- Banden reparatie mogelijkheid toegevoegd
- Jerrycan toegevoegd
- whitelist signed-in spelers van sommige jobs kunnen geen job groep meer aanmaken/joinen
- Characters met de HC role hebben nu toegang tot bank accounts van hun jobs als deze bestaat
- Parachute item toegevoegd
- Duikpak item toegevoegd
- Je krijgt nu meer geld voor de eerste jobs die je doet per dag.
- F1 Menu opties toegevoegd om snel porto te switchen voor politie/ambulance
- Politie kan nu makkelijk weten van wie DNA is doormiddels van DNA te gebruiken
- Je krijgt nu een beetje cash wanneer je naar de gevangenis wordt gestuurd om eten/drinken te kopen 
- Mails worden nu teruggezet als je UI restart
- Je kan nu altijd cornersellen maar met prijsvermindering in bepaalde situaties
- Je kan voertuigen nu ook recoveren via de garage lijst. Dit kan enkel wanneer je voertuig uit staat maar nergens meer op de map te vinden is

### Changed
- Mogelijkheid om verschillende verkoop aantallen per item te bepalen bij cornersell
- Minimum tijd voor bennys repair taskbar
- Voertuig lockstatus check gebeurd nu ook op einde van taskbar bij in/uit voertuig interacties
- Tweak meth bag price
- Voertuigprijzen voor A en A+ voertuigen
- Gebruik locker debt interval uit config in aankoopmenu tekst
- Cyclecuffs admin command van dev naar staff veranderd
- Radiotower swarms disabled
- Bij het refuelen wordt je wagen nu ook voor een percentage gevuld wanneer je cancelt
- Je ziet geen dollartekens in jobcenter app meer bij jobs waar payoutlevels niet gebruikt worden
- Meer data bij alle weed logs
- Increase required flags for anticheat ban
- Meth drytime verlaagd
- Melding bij het togglen van dispatch
- Group change function opgesplitst
- Heistsysteem opniew gemaakt

### Fixed
- Hoogte van camera en verrekijker gefixt
- Je kan weer met een baseballbat targetten
- Uncuff stopt als persoon tijdens uncuff actie weg is gelopen
- Restaurant stash polyzone op juiste moment destroyen
- Je health/armor wordt nu correct gerestored wanneer je de server inkomt
- Motor van NPC voertuigen blijft niet meer aanstaan als je deze uit de wagen trekt
- Fix doorlock polyzone hoogtes
- Kleine aanpassing om mogelijks het despawnen van wagens tegen te gaan tijdens het attachen van prop
- Towing wordt nu gehandeled door entity owner
- Fix anti space spam consistency
- Ontboeien checkt nu correct afstand tot target
- Mazebank bankingzone juist gezet
- Fix client dg-logs errors 
- Fix duplicate asyncExports helper throwing error for dg-lib scriptload

## [1.0.10]

### Added
- Phone Garage App bevat nu knop om verdwenen voertuigen terug in de garage te plaatsen
- Speedometer blijft staan als je maar 1 melding hebt
- Enkele stoelen toegevoegd om op te zitten
- Report WS wordt gesloten met een statuscode + reason
- Feedback bij een NPC toegevoegd over de werking
- Zeer veel nieuwe houserobbery locaties toegevoegd
- Locate player/vehicle commands toegevoegd aan adminmenu
- Actieve melding om weer te geven dat je in cloak/noclip ben
- Je kan nu garagelogs bekijken van gesharede overheids voertuigen
- Kleerkasten voor enkel businesses toegevoegd
- EMS ziet nu ook antwoorden op 112's

### Changed
- Bait price aangepast
- Politie kan dna swab enkel gebruiken als er geen ambu is
- Nodige materialen voor te verwerken aangepast
- Je kan nu meerdere materialen in 1 keer krijgen uit vuilbakken
- Je kan NPCs nu uit voertuigen trekken om deze hun wagen te stelen
- Prijzen van ID verlaagd
- Staff toegang gegeven tot changeModel command
- Cache admin points in backend to reduce load on DB
- Enkel admin command permissies aangepast
- Heel het houserobbery systeem herschreven, hopelijk werkt het nu deftig
- Lab requirements verlaagd
- Smelttijd verlaagd nu dat materialen per verwerkt minder zijn
- Meer info bij inventory destroyAll log
- Garagelogs worden nu gecached om database load te verminderen
- Websockets of reports are more stable
- Meer data bij confiscate log toegevoegd
- Kans op uitvliegen met normale gordel verlaagd
- Kans op voertuig stall bij crash verhoogd
- Anticheat speedchecks runnen nietmeer als je in admin cloak bent
- Reputatie voor meth verkoop verlaagd

### Fixed
- Je kan weer smelten als je meer dan de nodige items opzak hebt
- Fixed cursed date formatting for ban + properly get ban creation time
- Keycard toegevoegd aan crafting table
- UI Interactive app check werkt nu wel
- Fix dat stresseffect actief blijft
- Mechanic kan ticketjes voor tunes nu wel inbrengen
- Phone peekt nu deftig meerdere notifications
- Hersorteer bank transactions bij het laden van nieuwe
- Bank accountlijst overflowed niet meer en is nu scrollable
- Je kan niet meer cornersellen aan bepaalde NPCs
- Je kan motors nu wel afleggen als je sleutels niet hebt
- Betere manier om admin screenshot te kopieren
- Verwijderd gesavede mails nadat deze verzonden zijn
- Je kan methlab niet meer starten tijdens timeout
- Safety check op cornersell baseprice
- Foute invisiblity anticheat flags tijdens spawn/noclip/cloak opgelost
- Inventory drop removal throwed geen onnodige errors meer
- Nieuwste garagelogs sta nu bovenaan
- Admin dooropties werken weer
- Garagelogs zijn nu deftige gesorteerd op insertion moment + worden treffelijk geseed als het nog niet aan de cache limiet zit
- Fix business check voor clothingmenus
- Storerobbery kassa animatie stopt wanneer je taskbar stopt
- Fix probleem waarbij je inventory niet meer laad

## [1.0.9]

### Added

- DNA code wordt gekopieerd wanneer je DNA evidence gebruikt
- Extra politie kledij voor beter passende outfits
- Joints kunnen maken van weedzakje
- Animatie bij het maken van 112 melding
- Admin optie om itemstate by id te verkrijgen
- Weed container toegevoegd
- Extra ingame support adminrole toegevoegd
- Mechanics kunnen nu je voertuig tunen

### Changed

- Timeout toegevoegd aan lockpick dispatch call voor individueel voertuig
- Enkel dispatch call changes verlaagd
- Phone item kan nu verkocht worden voor bij fence
- Tweak blackmoney en cornersell payouts
- De knoppen van een phone modal worden gedisabled als hij bezig is met verwerken
- Voertuigverkoop modal verdwijnt na verkoop + refreshed garage lijst
- Oversized textures van enkele kleding stukken gedownscaled
- Je krijgt een melding als er geen EMS aanwezig is bij het maken van 112 melding
- Je kan bewusteloze mensen niet meer beroven
- Staff wordt niet langer ge-AFK-kicked
- Tweak hunting payout en dier kansen bij gebruik van bait
- Witwas kans verhoogd
- Als je nog eens sterft als je al neerligt reset je respawntimer altijd voor max tijd
- Lockers groter gemaakt
- Weedbud droogtijd verlaagd van 3 naar 2 dagen
- Banverloop datum wordt op FiveM server berekend ipv op de database
- Check of je nodige items hebt voor taskbar bij smelten
- Je kan niet meer boeien terwijl je aan het zwemmen bent
- Container requirements naar beneden

### Fixed

- Restaurant ticket wordt nu aan juiste persoon gegeven
- Correcte rotatie van yogamat tijdens animatie
- Minio filename generation heeft een timeout
- Je stapt niet meer uit het voertuig na het lockpicken
- Je krijgt niet langer de melding dat de deur niet opslot staat bij het lockpicken van NPC voertuigen
- Noclip movement blijft niet oneindig doorgaan indien keybinds gedisabled worden tijdens het inhouden van movementkey
- Admin giveitem aantal default nu deftig naar 1
- Nieuwe items die je ontvangt komen nu wel op de grond te liggen als je inventory vol zit

## [1.0.8]

### Added

- Nieuwe consistent manier om aan electronica te komen
- Meleewapens toegevoegd aan publieke containerbenches
- Enkele grote meleewapens hangen nu op je rug
- Toon een indicator of er een raportje is gemaakt of een bericht is verstuurd in een report waar jij deel van maakt
- Restore health and armor on join
- Copy VIN to clipboard when reading it
- Je kan nu minimap zien in noclip
- Alle restaurant medewerkers in dienst krijgen een percentage van het ticket als iemand anders een order maakt
- Judge job is nu geconfigureerd
- Added beep sound when a report notification comes through

### Changed

- Item naam toegevoegd aan itemmove log
- Meleewapens degraden nu een percentage na elke slag
- Container benches required players omlaag gezet
- Guards spawnen niet meer als er EMS aan de radiotower is
- Admins kunnen nu ook players freezen
- Je kan niet langer sprinten/springen als je een item object vast hebt
- Weedplanten voeden werkt nu hetzelfde als farmingplanten
- Spawnnaam van taxi gefixt
- Minder stress bij het oogsten van weed 
- Je gaat nu naar yogamat bij begin van anim ipv einde
- Stressicon komt nu pas vanaf een bepaalde waarde
- Moeilijkheid lockpicken per voertuigklassen

### Fixed

- Inventory item tooltip divider wordt niet gedisplayed als er niks onder staat
- Huisinbraak wordt nu correct afgerond
- Je wordt niet langer zichtbaar alsje in noclip bent en cloak uitzet
- Je gaat nu niet meer in een scuffed down state liggen
- Correcte taskbar icons/labels in weedlab
- Je input veld verdwijnt niet meer als je een chat bericht ontvangt
- Je voertuig kan niet meer stallen als de motor uitstaat
- Group job wordt nu wel gereset na bepaalde activiteiten
- Sanddigging graaf zone afstand verhoogd
- Optie om bepaalde lab locaties te disablen
- Je kan niet meer samen materialen smelten
- Bij het inleveren van tickets krijg je de juiste prijs tezien als notificatie

## [1.0.7]
### Added

- Feedback aan admin sendMessage command voor uitvoerder
- De owner van een restaurant heeft nu een menu om signedin employees te zien
- Ladder check thread om camping tegen te gaan
- Voertuig winkel voor ambulance en politie
- Serversided Belgische sirens
- Bij admin resource start worden all AFK kick gecleared uit de DB

### Changed
- Gain less stress from stress/speedzones
- Permissies voor fixScreenFadeout veranderd van dev naar staff
- Sticky notificaties worden nu gerestored na UI reset
- Je gaat nu automatisch uit dienst als je het restaurant verlaat
- Rework radiotowers om campers tegen te gaan
- Je moet niet langer in dienst zijn om restaurant stash te bekijken
- Increase aantal stress dat joint weghaald
- Paycheck bump
- Je kan de motor nu ook afleggen als je geen sleutels hebt
- Verbandjes geven meer health terug
- Fieldmaster is buyable voor Joran x

### Fixed
- poly(zone|target) debug prints do not check for `is_production` convar
- fixed citizenid field in `chars:select` log
- Check op null stance state
- Je gaat nu neer ipv bewusteloos van PD Glock
- Agenten kunnen nu huisinbraak huizen binnen
- Huisinbraken werken nu ietsje beter
- Labs logger niet op silly
- Fix ems vehicle shop npcs having same id
- Enkel save event emitten als je een character hebt gekozen
- Voertuig service reset nu deftig de handling van een voertuig
- Je kan nu terug je motor op slot zetten
- Een afgebroken voertuig onderdeel zorgt er niet meer voor dat peekopties disabled zijn
- Je wandelt niet meer rond terwijl je een notitie bewerkt op je telefoon
- Het probleem waarbij je probeerde je inventory te openen zonder dat hij openede is opgelost
- Recent calls kan je terug bellen + in contact zetten zonder dat deze al in u contacten moeten staan

## [1.0.6]

### Added
- Added some suggested clothing
- Added a fall-off timer implementation for points
- Added some suggested clothing

### Changed
- Doorlocks worden nu altijd gezet op server en niet op client
- Stancing gebruikt nu statebag handlers
- Labos herschreven in de superieure taal
- Je kunt nu niet meer op de whitelised radio channels als je uit dienst bent

### Fixed

- Je eject nu vanaf de voorkant van een wagen
- Een motor is nu niet langer automatisch illegaal getuned
- Je eject nu vanaf de voorkant van een wagen
- Timeout that reset spacePressed bool after 1s
- Correct voertuig gebruiken om lockpick native class te bepalen
- Je telefoon gaat niet meer weg als een notificatie verdwijnd

## [1.0.5]

### Added

- Removed ability to spacespam
- Reset en cop check aan fleeca toegevoegd
- Meer feedback bij het inloggen van houserobbery queue

### Changed

- Je kan niet meer in de voertuig als je iets vast hebt
- VinManager maakt intern gebruik van entityIds ipv netIds
- Prijs per items van fence verhoogt
- Tweak radiotower timeout
- Tweak radio crafting recipe

### Fixed

- Je kan terug compacts lockpicken
- Je telefoon gaat niet meer dicht wanneer je een melding krijgt
- Fix warnings bij het proberen tanken
- Npc deletion thread bij vehicle spawn weggehaald
- Er gaan geen random items meer aan je hangen
- Fixed houserobbery queue picker die oneindigd loopt om speler te vinden
- Er worden geen peds meer gespawned als je in een andere routingbucket dan 0 zit

## [1.0.4]

### Added

- Sloten op deuren/poorten van Low Santos toegevoegd
- Log toegevoegd wanneer speler server leavet terwijl hij dood/bewusteloos is
- Justice on-duty zones added
- Admins krijgen nu geen synced sounds niet meer als ze invis zijn
- Optie om sommige bennys niet als blip te tonen

### Changed

- Tweak nog wat inventory logger prints
- Voertuig prijzen voor klasse B,C,D aangepast
- Vereiste rechten van resetplayerprops veranderd naar staff
- Minder NPC dieren spawnen terwijl hunting job bezig is en je in een bepaalde zone bent
- Increase afstand van entity bij admin attach

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
- Geen AC weapon check meer als de speler dood is
- Straight Pipers kunnen nu wel een flatbed in hun garage krijgen
- Je kan nu praten terwijl je iets invult op je telefoon
- Gebruik VIN als identifier van testrit voertuig ipv netId om reuse van netId te voorkomen

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