# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [1.5.2]

### Added

- Je krijgt nu een melding te zien als de ghosting tijdelijk is uitgeschakeld
- Als je door een checkpoint rijdt wordt er een geluid afgespeeld

### Changed

### Fixed

- De blips tijdens een race toont nu enkel de nog niet gepasseerde checkpoints

## [1.5.1]

### Added

- Ambulanciers die als engiste in dienst zijn worden vanzelf gerevived
- Notepad item
- Gang app heeft een communicatie ruimte gekregen

### Changed

- Races die 30min na het geschatte startuur niet gestart zijn worden automatisch gestopt/verwijderd
- Banktruck requirements aangepast
- Tijd om een kassa leeg te roven aangepast.
- Requirements voor sommige criminele activities aangepast.
- Je valt niet meer uit de lucht bij het spawnen op je laatste locatie

### Fixed

- Nog een poging tot het oplossen van het SYN ACK probleem
- Je hebt nu ook de noodknop item nodig voor deze te gebruiken via F1
- Je gejoinde race is terug zichtbaar als je je UI herstart voor de start van deze race
- Reports
- Race countdown mechanism herschreven voor betere syncronisatie

## [1.5.0]

### Added

- Politie Interceptors toegevoegd
- Racing activity toegevoegd
- Kofi kledij toegevoegd
- Handlings voor de nieuwe DLC wagens

### Changed

- Je kunt mailbox verder van u huis zetten
- We hebben assets/aankleding rond de map opgekuist

### Fixed

- Probleem met SYN ACK fail positive dat leide tot bans
- Cornerselling werkt weer

## [1.4.8]

### Added

- Halloween shenanigans
- Voertuigen Los Santos Drug Wars toegevoegd.
- Map changes voor gangs
- Requested Hayes assets added

### Changed

- Tijd tussen aanbieding van huisinbraken verminderd
- Je kan langer onderwater blijven met een duikpak
- Removed overflow in admin entity selector action menu
- De bestanden voor de scripts die je download zijn verkleint
- m4gt3 uit carboostpool gehaald.

### Fixed

- Exploit in cornerselling opgelost
- Sentry sourcemaps werken terug
- Je character tped niet meer in de muur in de mazebank bij de trolleys
- Vrouwelijke voetballshirtje
- Je kan terug in unlocked houses
- Mailbox placeren

## [1.4.7]

### Added

- `ivy` ped added
- Nieuwe politie kleren toegevoegd

### Changed

- Job payout verhoogd
- Methlab: De beveilging lijkt verzwakt te zijn.
- Er is iets meer te vinden in de huisjes.
- Bert B zijn vriend betaalt nu beter uit.
- VPN wordt nu ook (ergens...) verkocht
- Betere boor en touw voor ATM overvallers.
- Winkelovervallen loot aangepast

### Fixed

- Probleem met telefoon notificaties die soms niet tevoorschijn kwamen opgelost
- Dubbel wiel uit mc20h model gehaald

## [1.4.6]

### Added

### Changed

- Aantal vereiste spelers voor banktruck gehalveerd.
- Staff kan nu ook enginesound / stancing aanpassen en synced objects plaatsen/verwijderen.
- Enkele handlings aangepast

### Fixed

- Debuglijnen van spikestrip weggehaald
- Probleem opgelost waardoor mazebank deur meteen opende na hack
- Prijsberekening van PDM salesticket gefixt
- Probleem opgelost waardoor peek opties niet zichtbaar werden in sommige gevallen

## [1.4.5]

### Added

- Sloten op deuren en kledingkast in Scrapz bedrijf
- Je kan nu sleutels geven aan de personen waar je in de wagen mee zit als je neer bent
- Je cursor is nu gecentreerd als je je inventory open doet
- Optie om iemand te reviven in de serverconsole
- Algemene camera optie toegevoegd om dit makkelijker te hergebruiken dev-wise
- Nieuwe activiteit toegevoegd om aan materialen te komen
- Optie om maillocatie meteen te markeren op GPS bij ontvangen van mail
- Je kan nu kiezen welke gordel je aandoen wanneer je een harness in je voertuig hebt (modifier key voor harness)
- Inhouse particles wrapper opnieuw geschreven om syncing te verbeteren

### Changed

- Regen bij CLEARING weather weggehaald
- Aantal staat nu standaard op 1 wanneer je iets koopt bij een business
- Salesticket bij PDM hebben nu een minimum en maximum waarde
- Idlecam in voertuigen gedisabled
- Werking van snelheidszones aangepast
- Plaat vooraan van LFA gehaald
- Meerdere handlings getweaked
- Telefoongesprek stopt nu vanzelf als ge dood/bewusteloos gaat
- Je hoeft niet langer enginesound manueel op te slaan
- Stressmiddelen helpen beter
- Dispatch cameras laden nu sneller
- Enkele textures in de Scrapz aangepast
- Vrouwelijke MC vest aangepast

### Fixed

- Je krijgt geen huisinbraak mislukt mail meer wanneer je groep verlaat na huisinbraak te voltooien
- Mogelijks probleem met keygame opgelost waardoor keypresses niet registreren
- 'Inventory vol' notificatie wordt niet meer gespammed als je meer dan 1 item krijgt
- Helicopters gebruiken nu wel benzine
- Gesprekkenlijst in messages phone app staan correct gesorteerd op nieuwste bericht
- Voertuigdamage RS6 Avant verlaagd

## [1.4.4]

### Added

- Je kan nu zoeken op contactnaam in je telefoon tijdens overschrijvingen etc
- Payconiq transaction modal geeft nu weer of transactie geslaagd is
- Je kan nu kiezen of je materialen of geld als payout van een vuilkarrit wil
- Carboosts hebben nu een GPS blip indien het voertuig geen tracker heeft
- Je kan nu een nummerplaat kopieren in de radargeschiedenis
- Spawnrate van voertuigen wordt nu tijdelijk verhoogd als je een oxyrun aan het doen bent
- Vesten voor de nieuwe MC's toegevoegd
- MC logo op hun gebouw geplaatst

### Changed

- Phone notificaties worden niet langer gedeclined als je op de notificatie zelf klikt
- Winkeloverval een beetje gerebalanced
- Politie auto vorderen een tikkeltje makkelijker gemaakt
- Bankaccount heeft nu prio om te betalen bij het tanken
- Tracker die door politie afgezet is, komt nu terug als je deze opnieuw probeert uit te schakelen
- Statebaghandlers voor voertuigen waar speler inzit worden nu verwijderd als speler niet in voertuig zit
- Vehicletypes worden nu gecached zodat voertuigen sneller en reliabler kunnen spawnen
- Decodingtools zijn nu multiuse
- Spikestrips kunnen niet langer onder voertuigen gelegd worden
- Carboost tijd tussen hacks verlaagd
- Lockpick difficulty van overheidsvoertuigen aangepast
- Kleine verandering aan manier waarop fuel wordt opgeslagen
- Handlings voor kofi voertuigen aangepast

### Fixed

- Error opgelost wanneer een item in of uit inventory van offline player werd gehaald
- Banktrucks werken nu wel deftig
- Maintenance fee calculation fixed
- Probleem opgelost waardoor quads spawnede als `sanchez`
- Nummerplaat van een vinscratched voertuig komt niet langer terug op naam van eigenaar
- Revolver staat nu geregistreerd als wapen waar je dood door bent ipv bewusteloos

## [1.4.3]

### Added

- Gebruiken van kogelbewijsmateriaal kopieert de serienummer nu naar je clipboard
- Staff kan nu actieve boosts cancellen bij scuff om Suliro en reputation te refunden
- Voertuigtracker blips hebben nu altijd een random kleur om beter te kunnen onderscheiden
- Nieuwe criminele activiteit toegevoegd
- Gates added for kingsmen

### Changed

- Politie radar opent nu terug als je terug instapt en deze voorheen aan stond
- Dispatch blips van eigen job zijn niet langer gegroepeerd
- Sticky notification gaan altijd zichtbaar zijn, ook als je phone gemute is
- Gespawnede voertuigen die niet van een player zijn spawnen niet langer met random kleuren (bv vuilkar, PostOP wagen, ...)
- Guard deathcheck naar serverside gemoved
- Tweak carhack difficulties
- Eigenaars van non-player owned voertuigen zijn nu "persistent" tussen iedereen
- Reputation voor laptopshop verlaagd
- Textures binnen de Taxi MLO veranderd voor TaxiJacky

### Fixed

- Enkele scuffed carboost voertuiglocaties verplaatst
- Probleem opgelost waardoor synced objects soms terugkwamen na deze te deleten
- Probleem opgelost waardoor je sommige plaatsbare items meerdere keren kan oppakken
- Vinscratched autos worden nu wel uit maintenance fees gefiltered
- Probleem opgelost waardoor politie cufflogs altijd leeg waren
- VIN van nieuwe voertuigen wordt nu correct gevalidate
- Juwelier reset nu wel als politie de deuren opent
- Dispatch blips van mensen in helicopters werkt nu (hopelijk) wel goed
- ANG reset niet meer na het heropenen van de tablet
- Maintenance fees werken terug (Bedankt voor de reports hierover! :kapp:)
- Recent called list is niet meer cursed AF
- Timer van phone notifications die optelde werken nu terug treffelijk
- Items resetten nu terug naar originele rotatie wanneer je ze loslaat buiten de toegestane grid
- Je kan weer flyers aanvragen
- Tijdelijk rainlevels gedisabled om wetness van kledij/puddle noises te fixen
- Je kan free lockers nu ook transferen naar players die al een locker bezitten
- Enkel politie kan nu effectief mensen hun inbeslag genomen items zien
- Cobrastudios burrito livery is nog maar een beetje lelijk op local burittos

## [1.4.2]

### Added

- Extra hulpmiddelen toegevoegd om despawnen van voertuigen te onderzoeken
- Mogelijkheid om tijd serverside te freezen
- Politie kan nu mensen uit een voertuig trekken (mbv wapenstok)
- Dice command heeft nu bijhorende animatie

### Changed

- Je kan racegordel aandoen/uittrekken nu annuleren
- Prison zone vergroot om false alarms tegen te gaan
- Methrun wordt nu gecanceled als voertuig niet meer bestaat
- Reputatie requirements en prijzen van hogere carboost classes aangepast
- Het voertuig model en klasse staat nu ook in de mail als je een boost contract start

### Fixed

- Pickup zones van benny-app order worden nu wel opgekuist
- Reputatie van offline player kan nu wel veranderd worden
- Racegordels checken nu of je na taskbar nog in voertuig zit
- Clock op je telefoon veranderd nu niet meer naar 0 wanneer je in een huis/appartement zit
- Flikkeren van skybox op bepaald moment van ingame dag is opgelost
- Problemen opgelost ivm syncen van het weer
- PostOP bus spawned nu met de juiste extras enabled
- Je kan nu wel meerdere items tegelijk kopen in de Bennys App
- Wapenupgrades op hopelijk alle voertuigen gedisabled
- Probleem opgelost waardoor je geen crypto kon transferen
- Windowtint reset niet langer wanneer je het applied
- Imgur links zouden nu terug moeten werken voor flyers
- Extra checks in apartment invite code om nil values in Player object tegen te gaan

## [1.4.1]

### Added

- Systeem waarmee je je positie behoud als je de queue verlaat en direct terug komt
- MC vesten
- Lege livery voor R33 toegevoegd

### Changed

- Queue systeem laat nu grotere groepen mensen toe als er ruimte is op de server
- Scuffed vrouwen kleding weggehaald
- Politie M5 federale livery gefinetuned

### Fixed

- Alle autos kunnen terug in bennys
- Core probeerd spelers met temporary id niet meer op te slaan
- Politie barriers werken weer
- Locker toegestane tijd wordt nu correct weergegeven
- Enkele scuffed voertuigen uit carboostpool verwijderd
- Report systeem werkt weer
- De `module is not defined` error bij het joinen van de server is weggehaald
- Queue boost werkt nu wel (for real this time)

## [1.4.0]

### Added

- Description field voor flyers toegevoegd
- Je ANG wordt doorzichtig als je met muis op het tablet-frame of erbuiten focused
- Politie kan nu geconfisceerde items bekijken op dezelfde plek waar je ze kan op halen
- Een brievenbus voor bij je huis
- Enkele kofi voertuigen toegevoegd
- Nieuwe wapens toegevoegd
- Nieuwe overval toegevoegd
- Politie kan nu een voertuig vorderen zonder dat ze een lockpick nodig hebben (Via F1 > Politie)
- Carboosting toegevoegd

### Changed

- Label veranderen van container start nu op oude label ipv volledig leeg
- Lockers blijven langer open voor je na het invoeren van het paswoord
- API is herschreven in fastify
- Ambulance kan nu ook DNA gebruiken om persoon te identificeren
- Enginesound volumes verlaagd
- Weedlab timeout minder gezet en loot getweaked
- Gebundelde files zijn veel kleiner
- Items om sneller te lopen verbeterd

### Fixed

- Sourcemaps voor onze code is nu werkend, we kunnen nu gemakkelijker errors debuggen
- Extras van emergency voertuigen worden staan nu standaard aan
- Custom enginesounds worden nu wel geapplied voor vehicles die in je buurt staan voordat je een character hebt geselecteerd
- Carrying checket nu closest player op client om mogelijkse server desync te voorkomen
- Het access systeem van de huizen werkt nu wel treffelijk
- Mechanics kunnen weer auto's impounden
- Spikestrips reliability improved
- Deads worden terug gelogged wanneer screenshot nemen niet lukte
- Je kunt terug op de elementen achter het contextmenu klikken
- Tackle reliability verbeterd
- Vergeten southside tankstation werkt nu wel
- Synced objects wachten tot collision is geladen voor ze treffelijk op de grond te zetten

## [1.3.1]

### Added

- Dynamische inventory icons (o.a. flyers)
- Politie kan nu barriers plaatsen die het NPC verkeer tegenhouden (F1 -> Politie -> Plaats Barrier)
- UI fontsize is aanpasbaar in config menu

### Changed

- Wat metadata van de flyer gehide
- Flyer links worden nu treffelijk gecontroleerd of ze wel naar een image wijzen
- Stash grootte van house wordt nu bepaald door house type

### Fixed

- Toon badge optie bij politie menu verwijderd (vervangen door item)
- Radio clicks teruggebracht

## [1.3.0]

### Added

- Dev command toegevoegd om voertuig despawnen te kunnen debuggen
- Mogelijkheid om voor elk drugslabs de toegestane interieren te bepalen
- Kofi vehicles toegevoegd
- Outfit tab toegevoegd aan "give clothing menu"
- Mogelijkheid tot het printen van flyers aan de printers
- Extra intern event gecaptured waarmee we meer errors kunnen zien
- Locker naam toegevoegd aan lockers/debts om makkelijker de correcte locker te vinden
- Mogelijkheid om stashes toe te voegen aan ganggebeiden
- Metadata aan een debt
- Add nuttys tailscale API as an allowed domain for the internal API
- `voice-r` command to reconnect to the mumble/voice server
- DSU zomer training camp
- Cobra studios livery voor burrito
- King pills polo texture
- Politie arm band voor vrouwen
- Politie M5 heeft nu ook de battenburg livery
- Add real estate (currently no decoration yet)

### Changed

- Meth cornersell reputatie vereiste verlaagd
- Inventory Itemlabel grootte verminderd
- Meerdere handlingen getweaked
- Vehicle status effects gerebalanced
- Je kan nu je voertuig recoveren als het in een garage staat waar je niet aankan (Bv na ontslag, ...)
- Alle wapens herbalanced
- Minder kans dat een heartbeat event gedropped wordt
- Native class van bmw m5 e39 aangepast
- Je kan nu sneller opnieuw respawnen indien ambulance je niet komt halen in het ziekenhuis
- Ambulance die alleen in dienst is, respawned nu meteen naar een bed
- PDM medewerker krijgt meer van een verkoop
- Scuff impound optie weggehaald voor burgers door abuse...
- Text size van chat is nu "responsive" gebasseerd op de aantal pixels in de hoogte van je game
- Distance toegevoegd aan carry + escort logs
- Enkele textures binnen MRPD zijn opgefrist
- SRT livery van Politie V90 aangepast
- Handling van enkele (politie) wagens getweaked

### Fixed

- Werking van spikestrips verbeterd op schuine ondergronden
- Juwelier hack is weer mogelijk als er een andere overval begonnen is
- Je kan niet langer starten met escorteren terwijl je in een voertuig stapt
- Probleem opgelost waardoor je geen voertuigen uit depot kon als de prijs 0 is
- Lampen evo9 gefixt
- Juwelier office deur gaat terug vast wanneer heist reset
- Seatbelt icoontje wordt nu ook geupdate wanneer je stil staat
- Typo in voertuigapp gefixt
- Je kan niet meer in een voertuig wanneer je een BMX vast hebt
- Ontvanger krijgt nu wel effectief crypto bij transfer
- Je kan geen locker meer transferen naar een speler die al een locker in bezit heeft
- Niet joinen in queue + boost van queue
- Probleem opgelost waardoor server crashete door refreshen van inaccessible drugslab
- RS7 ABT gaat minder snel visueel kapot
- Probleem opgelost waardoor dispatchmeldingen met voertuig soms niet doorkwamen
- Standaardwaarde van voertuigextras worden nu wel correct gezet
- Extras op industriele/commerciele voertuigen worden nu wel standaard geenabled
- Error opgelost wanneer je een verwijderd voertuig probeert van een flatbed te halen
- Keybinds die enkel een event moeten emitten zullen geen command meer executen, dit lost de event overflow op bij het spammen van o.a. `e`
- Mogelijke fix dat enginesounds van voertuigen die in je buurt zijn wanneer je inlaad, niet geapplied worden
- Tweets die je binnenkrijgt als de app niet openstaat krijg je niet meer dubbel te zien
- De lijst van de message app werkt terug
- Politie A6 en M5E39 hun zitplaatsen zijn gecorigeerd
- Je wordt niet meer gekicked door AFK timer tijdens char creation
- Dispatch flicker bij nieuwe melding opgelost

## [1.2.12]

### Added

- Confirmatie menu toegevoegd bij aankopen van laptops
- Triple click item om itemId te kopieren (enkel als admin)
- Ambulance personeel kan nu een medbag op de grond plaatsen
- Mogelijkheid om kledingkasten voor gangs te plaatsen
- Nieuwe ped toegevoegd
- Er zijn wat verbouwingen gebeurd in grapeseed
- Nieuwe kofi voertuigen toegevoegd

### Changed

- Je kan niet langer een bord vastnemen als je in een voertuig zit
- Politie requirements check bij juwelier aangepast om vitrines open te breken
- Zand past nu in een materiaaldoos
- Extras van rago kunnen niet meer aangepast worden
- Je kan nu de kwaliteit van een methzak zien zonder deze te openen
- Streamfest reclame toegevoegd aan ingame bussen

### Fixed

- Probleem opgelost waardoor sommige inventory containers niet geopened konden worden
- Je kan geen BMXen uit PDM meer vastnemen
- Je kan terug dumpster inventories openen
- Rotatie van trolley in sandy fleeca veranderd
- Enkele scuffed houserobbery locaties verwijderd
- "Querry" hernoemd naar "Groeve"
- Methlab log types gecorrigeerd
- Je kan Krikkes wijn nu wel effectief drinken
- Voertuig suspension gaat weer kapot

## [1.2.11]

### Added

- Zones toegevoegd waar niks op de grond gelegd kan worden
- Tijd toegevoegd aan gangfeed bericht
- Er kan geen nieuwe overval meer gestart worden als er net een andere is gestart
- Blips toegevoegd aan PostOP dropoff locaties
- Optie om je crosshair uit te zetten via /config menu
- Je kan nu sommige verkeersborden meenemen
- Mogelijkheid om een BMX vast te nemen
- Haarnetje item toegevoegd
- Kleine paycheck voor laywers/judge toegevoegd
- Kampeertafel item toegevoegd
- Nieuwe handlingen voor meerdere kofi vehicles
- Reclame borden en vlaggen aangepast
- Je kan nu zitten op de stoelen in het stadshuis
- Parking en kledingkast toegevoegd aan SandyPD

### Changed

- Loot changes van dumpsters getweaked
- Durability handboeien verhoogd
- Dispatch blip grootte aangepast
- Politie kan niet langer zomaar mensen rechtzetten
- Koperknippen minigame aangepast
- Voertuiglock houdt niet langer rekening met nieuwe state om notificatie te betalen
- Je steekt je wapen niet meer weg bij het disablen van radiotowers
- Scrapyard maakt nu gebruik van mail ipv blip om locatie aan speler te geven
- Aantal CBD zakjes per weedbud verhoogd
- Aantal server calls om player items te cachen verminderd
- Amerikaanse politielogos op kleding vervangen door belgische

### Fixed

- Fix engine sound hash of mazrx7fd
- Foute notificatie dat je geen lockpick hebt opgelost bij parkeermeters
- Je kan weer mensen opbellen via je telefoon
- Nieuwe twitter berichten worden nu wel gedisplayed zonder dat je app opnieuw moet openen
- Geen log meer wanneer er geen missing/invalid vehicle models zijn
- Enkele scuffed houserobbery locaties verwijderd
- Important log verwijderd bij inleveren van testvoertuig wanneer geen testrit actief is
- Juwelier vitrines laden nu wel correct in als ze al kapot zijn wanneer je binnen gaat
- NPC wagens waar spelers in rijden kunnen niet meer geselecteerd worden als oxy koper
- Oxyrunvoertuig toeter is nu altijd hoorbaar voor speler die oxyrun doet
- Fix verkeerd verkrijgen van playergang bij enteren van container
- Fix errors bij enteren van heistlocations zonder geregistreerde manager
- Error opgelost bij atm robbery
- Filter steamname color prefixes in admin names cache
- Repair items cancelen wanneer je de minigame failed
- Juwelier camera IDs in dispatch meldingen gefixt
- Error bij cleared van status na revive opgelost
- Doorzoeken peek optie wordt niet meer getoond op NPCs die niet bij een job horen
- Radialmenu zou niet meer op je scherm mogen te komen vaststaan
- Nieuwe items die je krijgt wanneer je inventory vol zit, liggen nu niet meer op elkaar op de grond
- Fuellevel bij in garage zetten wordt nu correct in de garagelogs geplaatst
- Beschikbaarheid van laywers/judges worden nu wel correct weergegeven na het te togglen
- Voertuig enginestatus hud icoontje gaat weer weg als de wagen gemaakt is
- GXS14 Voertuig seating position gefixt

## [1.2.10]

### Added

- Default stance toegevoegd voor evo9, rcf
- Nieuwe kleine criminele activiteit toegevoegd
- Extra loot toegevoegd aan vuilbakken doorzoeken
- removeUiFocus commando toegevoegd om je cursor weg te halen wanneer deze vast zit op je scherm
- Manier toegevoegd om intern voertuig te blokkeren uit Bennys
- Kofi voertuigen toegevoegd
- Serverside functions toegevoegd om map NPCs te spawnen
- Optionele locatie knop toegevoegd aan phone mails
- Nieuw guard spawning systeem toegevoegd om makkelijker en beter enemy NPCs te spawnen
- Nieuwe criminele drugs activiteit toegevoegd
- Commands toegevoegd om gangs te creeren/verwijderen
- Verschil tussen twitter reply en retweet toegevoegd
- Manier toegevoegd om als politie deuren te openen
- Admin command op coordinaten van objecten te kopieren toegevoegd
- Nieuwe overval toegevoegd
- Mogelijkheid toegevoegd om ingame voertuig engine sounds aan te passen
- Politie badge kledingstuk toegevoegd
- Nieuwe ped toegevoegd

### Changed

- Override CID entry toegevoegd om kofi vehicles te kunnen assignen aan offline vehicles
- Bennys repair prijs berekening aangepast
- PostOP payout getweaked
- KingPills Bandage crafting recipe en uses aangepast
- Kans op regen verlaagd
- Voertuig trackers worden nu verwijderd wanneer je uit dienst gaat of wanneer voertuig niet meer bestaat
- Start ingame tijd op middag op dev server
- Windowtexture dbxultimate gefixt
- Phone Mails blijven nu staan als je relogged tijdens dezelfde restart
- Tweak houserobbery loot
- Vallen bij springen verminderd
- Optie om ervoor te zorgen dat voertuigen met bepaalde vins niet meer gelockpicked kunnen worden
- Je wapen gaat niet meer weg wanneer je armor aandoet
- Calico stancing gefixt
- KingPills job kan nu meerdere locaties na elkaar doen

### Fixed

- Motor gaat nu uit tijdens noclip om engine sounds te voorkomen
- Fuel wordt nu terug correct gezet wanneer je een persoonlijk voertuig uithaalt
- Hopelijk probleem opgelost ivm mensen kicken
- Suspension gaat nu wel kapot bij wagens waar suspension visueel niet kapot gaat
- Failed heartbeat bans opgelost wanneer speler crashed tijdens inladen
- Probleem opgelost waardoor identifiers niet correct verwijderd worden
- Probleem opgelost dat je laatste locatie out of bounds kan zijn
- Er kan weer een takelopdracht gemaakt worden voor politievoertuigen
- Je wordt nu wel losgelaten wanneer diegene dat je escort down gaat

## [1.2.9]

### Added

- Ingame kofi voertuig shop toegevoegd
- Nieuwe kleding toegevoegd

### Changed

- Tijd voor paleto hack hoger gezet
- Je laat mensen nu los wanneer je dood gaat
- Mechanic crafting recipes aangepast

### Fixed

- Probleem opgelost waarbij containers visueel leeg zijn nadat je reloggen met een container opzak
- Grote Repairkit is nu wel zichtbaar in mechanic crafting bench
- Probleem opgelost waardoor de uren hetzelfde waren als minuten bij de indienst tijd
- Je krijgt geen houserobbery fail email meer wanneer je een groep verlaat
- Cuff minigame niet langer beschikbaar wanneer je down bent
- Probleem opgelost waardoor je UZI nog kon gebruiken in voertuig
- Blip problemen van dispatch systeem opgelost

## [1.2.8]

### Added

- De blip van een agent verdwijnt van de map als die zijn noodknop niet meer in zijn inventory heeft
- De items met de laagste quality worden nu als eerste gekozen in een inventory (Bv. crafting, drugs verkopen, ...)
- Mechanics hebben nu de mogelijkheid om wagens visueel te repareren
- Systeem toegevoegd om in dienst tijd te kunnen tracken
- Personen gaat nu automatisch uit dienst wanneer ze ontslagen worden van een whitelisted job
- Business Owners en HC van whitelisted jobs kunnen nu zien hoe lang mensen in dienst zijn geweest
- Rijden met kapotte banden beinvloed nu je voertuig status
- Commando toegevoegd om je armor visueel te togglen (/vest)
- Blips toegevoegd in de gevangenis om makkelijker de uitgang te vinden
- Extra logs toegevoegd op het verkopen van een voertuig via de garage app
- Meer info bij cashlogs toegevoegd
- Phone notificatie toegevoegd wanneer er een nieuwe ad wordt geplaatst
- Alot of new clothing

### Changed

- UZI kan niet meer in een voertuig gebruikt worden (Balancing TOV p90)
- Alle S class voertuig prijzen met een vast percentage verlaagd
- Voertuigparking van eigenaar geswitched
- Density van rijdende voertuigen verminderd
- Bennys repaired niet langer je banden, ga maar op zoek naar reservewielen ;)
- Prijsberekening van bennys aangepast
- Lonen van whitelisted jobs een beetje verhoogd
- Boeien uitbreken is moeilijker geworden als je al enkele keren hebt uitgebroken
- Geld dat mechanics krijgen per parts verhoogd om meer in lijn te liggen met verdiensten van andere jobs
- Voertuigen spawnen nu altijd proper
- Automatische stancing voor A6 toegevoegd

### Fixed

- Exploit om houserobbery timeout te skippen opgelost
- Je kan de kleur van de Range Rover Vogue nu wel aanpassen
- Dispatch seed enkel calls van je eigen job
- Motor gaat nu reliable aan wanneer je via adminmenu een voertuig spawned
- Je gaat nu correct uit dienst bij een bedrijf wanneer je de server verlaat
- Takelopdracht blips gaan nu weg wanneer je het voertuig takelt
- Je kan weer extras veranderen in bennys
- Error opgelost wanneer je probeert te bellen in de gevangenis als je geen contacten hebt
- IsContainer metadata op containers is niet meer visible

## [1.2.7]

### Added

- Admin command toegevoegd om inventories te unloaden
- Logs toegevoegd om het maken van mechanic parts
- Extra gang garages toegevoegd
- Enkele doorlocks toegevoegd
- Custom textures in townhall & sandyPD
- Extra gang kleding

### Changed

- Knoppen in character selection menu zijn van plaats en kleur veranderd zodat ze beter hun actie representeren
- Je dient nu de naam van ja karakter in te typen als je deze wilt verwijderen ter confirmatie
- De queue ziet er wat beter uit
- Als je in een voertuig TPed zal je uit noclip geforceerd worden
- Politie revive wanneer er geen ambulance is, extra gelimiteerd om abuse te voorkomen
- Cobra studios t-shirt

### Fixed

- Error van doorlock tijdens inladen opgelost
- Aantal nodige materialen bij mechanics wordt nu correct weergegeven
- Probleem bij het inladen van een inventory opgelost door case-sensitivity van inventory ids
- Peek opties die items vereisten werken nu ook als het item in een container in je inventory zit
- Je doet nu wel altijd de drop item animatie wanneer je iets op de grond legt
- Je kan nu craften met items die in een container in je inventory zitten
- Ja blijft niet meer vasthangen op checking banstatus etc
- Problemen met impound kost opgelost
- Kapotte items worden nu wel expliciet gecheckt om ze te verwijderen na een restart
- Notificatie tekst bij voertuig op slot zetten is nu juist
- Koplampen Subaru GT86

## [1.2.6]

### Added

- UI devtools kan nu ook een IG image tonen
- Restaurant medewerkers krijgen nu een extra paycheck wanneer ze in dienst zijn
- Slot op deur in KingPills toegevoegd
- Je kan nu alle items van een soort in 1 keer selecteren in je inventory (check het questionmark icon in je inventory)
- Items die in een container zitten, tellen nu mee als items in je inventory. Dit betekend dat je bijvoorbeeld materialen er niet meer hoeft uit een container moet halen wanneer je iets wil craften.
- Flare item toegevoegd te gebruiken bij evenementen
- Voetbal jersey

### Changed

- Report indicator aangepast naar iets duidelijker
- Je kan stressitems nu gebruiken in een auto
- Mechanics maken nu items met materialen die in de businessstash zitten in plaats van je eigen inventory
- Je kan weer springen als je iemand escorteert
- Aantal materialen per verwerkt materiaal verdubbeld maar alle nodige verwerkte materialen in crafting recipes gehalveerd. Dit zodat je effectief inventory space kan besparen door materialen te verwerken zoals origineel de bedoeling was van het verwerkt materiaal
- Je ziet nu de service status van een voertuig in de garagelogs
- De extra bomen zijn veranderd naar een minder dense pack
- Enkele textures in MRPD
- Handlings van alle imports + enkele GTA voertuigen aangepast

### Fixed

- Standaard prijs van items van nieuwe business is niet meer 0
- Foutmelding bij unlocken van voertuig opgelost
- Een gang kan niet langer een bepaald item meermaals vinden
- Verwijder nieuwe business zones bij verlaten van business
- Wanneer je een debt betaald verdwijnt hij vanzelf uit de app
- Antibiotica pill refilled je armor niet meer instantly
- Je kan enkel nog armor items retreiven, en niet langer de armor regenererende items
- Joint smoke animatie vervangen om deze ook te kunnen gebruiken voor vrouwen
- Peek entries worden nu deftig verwijderd bij KingPills job
- Eerste sirene die je afspeelt na het joinen zul je ook weer kunnen afzetten

## [1.2.5]

### Added

- Mogelijkheid om lockers toe te voegen die geen animatie afspelen
- Meer stancing mogelijkheden en extra modellen toegevoegd met standaard stancing
- Een nieuwe tab toegevoegd in de gang app, be sure to check it out
- Nieuwe business toegevoegd met bijhorende job
- Er zijn bomen rond het eiland geplant
- De Vespucci market is opengegaan
- Extra pride schoenen
- Kleding voor kingsmen

### Changed

- Houserobbery en storerobbery payout verhoogd
- Aantal materialen dat je krijgt bij veel activiteiten verhoogd
- PostOP aantal locaties per route veranderd
- Crafting reputatie requirement van startitems verlaagd
- Locker animatie speelt enkel wanneer je de eerste keer het wachtwoord ingeeft
- Voertuig upgrades volledig herwerkt om fouten met applyen van upgrades tegen te gaan en voor aangenamere developer experience
- Volume van de normale sirene is weer wat verhoogd
- Blips categorieen opgesplitst naar spelers(voor admins), politie en ambulance
- Player requirements van enkele activiteiten aangepast
- Kans op speciaal item uit banken aangepast
- Container keys gaan minder lang mee

### Fixed

- melding van /me en /dice komt nu niet meer op je scherm als je niet in line of sight bent van de sender
- Garagethreads worden gestopt wanneer je de server verlaat
- Je ziet nu je telefoon notities weer na een restart
- Je kan weer telefoon notities delen met elkaar
- Je ziet meteen een nieuwe notitie in plaats van je app opnieuw te moeten openen
- Voertuig degradatie zorgt nu weer effectief voor mindere goeie voertuig performance
- Heli, vliegtuigen, boten en submarines spawnen weer met alle componenten

## [1.2.4]

### Added

- Developer optie toegevoegd om item metadata aan te passen
- API endpoint om account balance te veranderen
- `/dice` command toegevoegd
- Pride clothing
- Chat melding voor wanneer er een nieuw report wordt gemaakt
- Advocaten kunnen nu facturen versturen vanuit de jusitie app
- Voertuig class modes toegevoegd
- Enkele extra liveries toegevoegd aan: V90 (politie), Rago (politie), a6 (politie)

### Changed

- Randomization van maintenance fees weggehaald om veranderende waardes bij toekomstige fees te voorkomen
- Police heli geallowlist voor camera
- Je kunt geen politie voertuigen meer in beslag nemen
- Handlings van politie voertuigen gebuffed voor andere voertuigen beter te kunnen bijhouden
- Scuffed livery van Porsche GT3 verwijderd

### Fixed

- Je kan geen debts meer betalen als je het geld er niet voor hebt
- Fix vehicle siren error wanneer het voertuig waar je inzit gedelete wordt
- Phone notificaties worden nu automatisch gedeclined wanneer je geen phone hebt om problemen te voorkomen
- Invisible collision bij Up-n-atom parking
- Jobs zonder loon blijven hun leefloon krijgen
- Het is minder makkelijk om samen hetzelfde voertuig uit te halen
- Bennys laptopapp gebruikt nu itemlabel ipv itemname in cartlist
- Random tick in siren weggehaald
- Je kan niet meer cuffen wanneer iemand al gecuffed wordt
- Crash wanneer je knop indrukt tijdens het inladen opgelost
- Admin blips en dispatch blips hebben geen last meer van blips die elkaar overschreven
- Normale deuren sluiten weer automatisch wanneer je ze op slot doet
- Minder kans op false flags van anticheat
- Politie interventieband beweegt niet meer in de wind
- Scuffed windowtint van RAM 2500

## [1.2.3]

### Added

- Requested ped added
- Extra kleding voor businesses toegevoegd
- Kleerkast voor Taxi Jacky en BlazeIt toegevoegd.
- Sommige garagepoorten worden nu open geforced
- Lifeinvader mlo + relaed business items added
- Brandweervoertuigen toegevoegd
- UC voertuigen toegevoegd
- Benny locaties voor lucht voertuigen toegevoed (Grote hangaar LSIA & Fort Zancudo)
- Extra kleuren voor stethoscoop toegevoegd
- Badge voor ambulance toegevoegd
- Weedplanten systeem herwerkt

### Changed

- Engine & brakes upgrade impact is gelijk getrokken voor alle addon wagens met een custom modkit
- Oversized textures van meerdere kleren zijn gereduced voor betere FPS
- Tweak service status labels
- Fleeca & Paleto opbrengst gebuffed
- Restaurant payout voor werknemers verhoogd
- Classes + prijzen herbeken van voertuigen
- Remmen gaan langer mee op voertuigen met slechte remmen
- Siren systeem herwerkt om UC voertuigen te ondersteunen
- Agenten kunnen via een toggle siren spot aan/uit zetten op ondersteunde voertuigen
- Lucht voertuigen + fietsen hebben geen mechanic services meer (enkel repairs in bennys nodig)
- Federale politie X5 is vervangen door een M5 wegens optimalisatie problemen
- Handlings van overheids voertuigen aangepast

### Fixed

- Je kunt nu niet meer gebeld worden als je je telefoon niet bij hebt
- Je spawnt nu weer altijd in je appartment als je nieuwe karakter aanmaakt
- Je bankrekening wordt gecapped op 2 cijfers na de komma
- Advertenties werken weer
- Taxi bedrijven hebben nu ook de mogelijkheid om eigendom access te geven aan business roles
- Beltoon problemen met telefoon zijn opgelost
- Je kan terug contact gegevens delen
- De persoon die gebelt wordt ziet terug treffelijk door wie hij gebeld wordt
- Tijd van twitter terug onder naam verplaatst
- Fix rotatie van voertuig is direct correct bij het spawnen hiervan
- Enkele scuffed garage spots gefixed
- Probleem met caching van bepaalde info opgelost. (zou kick/ban problemen moeten oplossen)
- Je wordt niet meer gebanned door sommige animal ped models
- Probleem ivm lockers die opeens geunassigned werden is opgelost
- Flatbed toegevoegd aan PDM

## [1.2.2]

### Added

- Meer data toegevoegd aan prison leave log
- General statebag handler wrappers added to avoid code duplication
- Tankstations + garages voor helikopter/vliegtuig toegevoegd
- Je kan nu je armor terug afdoen via F1 of het `/retrieveArmor` command

### Changed

- Je kan personen niet meer op de bestuurdersstoel zetten
- Meer kans op specialitem bij ATM robbery
- Je ziet nu enkel wie recent de server heeft verlaten terwijl hij in je buurt zat in de idlist
- Paycheck van politie/ambulance verhoogt
- Verbandjes gaan minder snel kapot
- Geupdate naar nieuwe Gabz versie
- Financials laad transactionIds voor accounts niet meer 1 per 1 maar in bulk

### Fixed

- Inventory items kunnen niet langer over de Y limiet gaan tijdens het RMB'en
- Voertuig kleur informatie in dispatch melding wordt nu correct getoond wanneer voertuig custom kleuren heeft
- Koperpaal aan HB weggehaald wegens problemen met de ladder
- Crypto Transfers werken weer
- Idlist ids distance check werkt weer
- Tax op lockers is terug
- Nieuwsitems verdwijnen nu als ze uit je inventory verdwijnen
- Resume looped anim on ragdoll
- Nieuwe mensen kunnen weer characters maken
- Je kan weer characters deleten
- Admin penalty module wat opgekuist en gepolijst tegen sneaky bugs
- Telefoon notities permanent delen is betekend dat je in een gedeelde notitie gestoken worden waar je iedereen hun wijzigingen kan zien (Geldt enkel voor nieuwe notities)
- Probleem waarbij zones niet goed ingeladen werden opgelost
- Je kan terug de laatste locatie kiezen om te spawnen als je binnen de noden hiervoor valt
- Overdue debts worden nu weer vanzelf verwijderd

## [1.2.1]

### Added

- Geldcontainer toegevoegd
- Extra anticheat bans waar nodig toegevoegd
- Je moet nu ook overgeven als je teveel gedronken hebt

### Changed

- Methbrick van uiterlijk veranderd
- Prijzen voor S & X voertuigen bepaald
- Info endpoint bezit nu ook informatie over de queue

### Fixed

- Mechanics kunnen nu weer in hun business stash
- Users worden nu wel gesaved wanneer ze server leaven
- Prison item retreival stashes kunnen weer geaccessed worden
- Mobiele payconiq betalingen werken weer
- Phone messages worden nu wel gemarkeerd als gelezen
- Nummers boven personen hun hoofd worden nu altijd getoond ipv soms als er veel personen op 1 plaats waren

## [1.2.0]

### Added

- Duidelijke melding wanneer je begint met bloeden
- Replace our stripped down QBCore with an in-house player mgmt resource
- Log when choosing a spawn location
- Re-added husky + pretty-quick for code formatting before commit
- Report menu icon btns hebben nu een tooltip met verduidelijking voor de knop
- Kampeerstoel toegevoegd

### Changed

- Politie verliest zijn spullen niet meer door het respawnen
- Minder lang plaatsen van groenten
- Minder stress wanneer je in een wagen zit
- YTD's van enkele voertuigen gedownsized
- winston-sentry-log dependency vervangen door in-house (fixed sentry type getting confused with v6 vs v7)

### Fixed

- Lag tijdens het uitvoeren van oxyrun opgelost
- Loading spinner in UI wordt nu treffelijk geplaats in zijn modals
- Serverside local dgx events worden nu wel geregistreert
- Een laptophack failed nu niet als je laptop kapot gaat tijdens de hack

## [1.1.5]

### Added

- Feedback notificatie toegevoegd aan ATM robbery
- Staff kan nu een tijdelijke evenement blip plaatsen
- Enkele items recyclebaar gemaakt
- Extra carwashes toegevoegd
- Enkele aangevraagde job kledingstukken toegevoegd
- Politie kan nu mensen rechthelpen als er geen ambulance is
- Nieuwe criminele activiteit toegevoegd

### Changed

- Je ziet de instel optie niet langer als je een doos vast hebt in het methlab
- Support heeft nu ook de fill-needs admin optie
- Opbrengst van enkele criminele activiteiten aangepast
- Plate lock toont nu meer informatie over het voertuig
- Enkele items als 'marked for seizure' aangeduid
- Textures van Otto's geupdate naar business specifieke varianten
- Verschillende types important dispatch meldingen toegevoegd
- Ophanging gaat minder snel kapot
- Minder shotmeldingen wanneer je wapen een suppressor heeft
- Het restaurant leftover buy menu sluit niet meer wanneer je iets koopt
- Enkele crafting requirements verlaagd
- 'Gemarkeerd voor inbeslagname' staat nu in een kleur in je inventory om het duidelijker te maken
- Je kijkt nu altijd vooruit na het nemen van een lift

### Fixed

- De driver bij een ATM robbery hoeft niet langer uit te stappen voordat hij de ATM van de muur kan trekken
- Voertuig slot is nu wel deftig toggleble de eerste keer dat je dit probeerd
- Er wordt nu effectief gechecked of een voertuig een politie heli is om helicam te activeren
- Decals die niet aangepast/weggingen bij outfits gefixed
- Emotemenu enabled niet alle controls meer
- Het laden van businesses throwed geen errors meer als businesstype niet bestaat
- Speling rond maintenance fee schedule toegevoegd om te voorkomen dat deze niet berekend wordt
- R32 en M5 F10 hebben opnieuw audio
- Je ziet nu de prijs incl tax bij de voertuigrental
- Je voertuig zal niet meer stallen door een meleehit
- Fix Vehicles error wanneer dg-config gerestart
- Fix items die niet opgeslagen werden wanneer ze gemoved werden naar inventories die niet geopend zijn door speler
- Het craften van een reservewiel werkt weer als mechanic
- Houserobbery deurzone spamt geen warnings meer in je console
- Fix error wanneer meerdere mensen samen een ATM willen opnemen
- Je kan weer zones based ATMs accessen

## [1.1.4]

## Added

- Re-added custom MRPD/Pillbox textures
- Een item in je inventory probeert nu in zijn huidige rotatie te blijven wanneer je dit quickmoved
- Enkele extra checks toegevoegd op het maken van een 112
- First Person Cam die gebruikt werd bij pdcam en verrekijker verplaatst naar eigen module om makkelijker opnieuw te gebruiken
- Je kan nu rechtstreeks fotos maken met de PD Camera
- Nieuws gerelateerde items toegevoegd
- Keypad UI toegevoegd
- Mogelijkheid toegevoegd om particles te creeren op serverside
- DGX class voor NPCs om geen explicit exports te hoeven gebruiken
- Paleto heist toegevoegd
- Extra impound reden toegevoegd
- ATM overval toegevoegd

## Changed

- Veel item decaysnelheiden verlaagd
- Enkele crafting recipe requirements verlaagd
- Hoeveel materiaal je krijgt voor sommige methods verhoogd
- Ambulance ziet meer info bij het inchecken zodat ze een tegenmelding kunnen sturen
- Hogere kans om specialloot te krijgen uit storerobbery kluis
- Politie voertuigtrackers herwerkt zodat deze niet naar het verkeerd voertuig refereren
- Verbandjes gaan langer mee
- Redelijk wat luxury-voertuighandlingen aangepast

## Fixed

- Fixed vehicle plate thread getting stuck on non-existing vehicles
- Er wordt nu wel een sound afgespeeld bij important dispatch meldingen
- Fix items die naar positie 0 gaan wanneer inventory vol is tijdens het moven van meerdere items
- Items verdwijnen nu wel visueel als je je inventory open hebt wanneer een item gedestroyed wordt
- Radiotower timeout randomization gefixt
- Wapentinting werkt weer na de move naar serverside weapon setters

## [1.1.3]

## Added

- Liften en stoeltjes in Maze Bank Arena bruikbaar gemaakt.
- Je krijgt het serienummer van een wapen op je clipboard wanneer je het gebruikt
- Aangenamere scrapyard locaties toegevoegd
- Je kan nu items in je inventory selecteren om deze snel te veplaatsen
- Je kan containers nu een label geven
- Er is nu een tutorial tooltip in je inventory om info te geven over de beschikbare controls
- Inbeslagname reden toegevoegd

## Changed

- Straightpipers op nieuwe locatie
- Groter verschil tussen methlab settings
- Koffer afstand check voor te openen verhoogd
- Screenshot-basic is vervangen met een in-house up to date tool
- Schotmeldingen configurable gemaakt per wapen
- Zichtbare craftables verhoogd in specifieke benches
- Weedplanten voeding gaat trager naar beneden
- Vuilbak doorzoek taskbar gaat sneller
- Voertuig status decrease een beetje meer gebalanceerd
- Mechanics ticket prijzen getweaked
- Politie/ambulance paycheck tikkeltje verhoogd na het toevoegen van leefloon
- Vectors van synced objects worden nu onder de juiste naam opgeslagen in de DB
- DNA swab decayrate verlaagd
- Bandage goedkoper gemaakt voor ambulance

## Fixed

- Fix speedbans wanneer je uit wagen vliegt of onder de grond valt
- Je kan niet meer zandgraven terwijl je in een voertuig zit
- Je groep stopt nu correct na het uitvoeren van scrapyard job
- Items gaan nu direct kapot wanneer hun quality op 0 wordt gezet ipv pas wanneer je je inventory opent
- Items die weggaan door ze te usen komen nu niet meer terug na te reloggen
- Mechanic repairparts kunnen nietmeer gebruikt worden als er iemand in het voertuig zit om te voorkomen dat parts overschreven worden
- Probleem met rotaties van synced objects die niet altijd juist opgeslagen/geapplied werden

## [1.1.2]

### Added

- Parking toegevoegd voor taxi bedrijf
- Scheduled maintenance fees zijn zichtbaar in de app 1 week voordat ze effectief betaald moeten worden
- Mazebank Arena interior toegevoegd met mogelijkheid om te veranderen door staff
- Emote toegevoegd
- Command `reportHouserobbery` toegevoegd om je huidige houserobbery locatie te melden as scuffed (door water etc)
- Add taxi als businesstype

### Changed

- Porto crafting requirement aangepast
- Je wordt nu losgelaten wanneer je gerevived wordt
- Calculaties voor voertuig maintenance fees aangepast
- Mitshubitshi Evo 6 heeft nu werkende zitplaatsen op de achterbank
- Armor crafting recipe aangepast
- Materialen van gerecyclede items aangepast

### Fixed

- Je kan weer vissen nadat je een vis hebt gevangen
- PDM medewerkers kunnen nu wel voertuigen verkopen met lage klasse zonder ze opnieuw te moeten selecteren
- Sanddigging UI interactions overwriten elkaar nu deftig
- Fix wielen die van naar een scuffed kleur veranderen in bennys
- Stances van voertuigupgrades blijven nu staan als je van bennys category switcht
- Collision van synced entities kloppen nu (Peek op o.a. weedplanten zou hiermee gefixed worden)
- Je ziet de doos in je handen weer in de labs
- Animatie terwijl je neer bent switched terug als je in/uit voertuig gaat
- Automatische toegang tot bankaccount voor whitelisted jobs is gefixed en nu enkel voor HC personen
- Fix fleeca sandy trolley rotation
- Je kan als bijrijder nu wel de politie voertuig locker openen terwijl het voertuig rijdt
- Testrit return zone bestaat nu ook als je gecrashed bent
- Volume config opties werken nu wel
- Tweak meth cornersell price

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
- Je kan nu aankopen doen in de shop bij otto's garage

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
- Fix hoge resource usage wanneer je wapen vasthebt
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
