# DG-Financials

## Tax informatie

| taxId | Naam        | StandaardWaarde |
|-------|-------------|----------|
| 1     | No Tax      | 0.00%    |
| 2     | Vehicles    | 0.11%    |
| 3     | Real estate | 0.10%    |
| 4     | Income tax  | 0.09%    |
| 5     | Services    | 0.07%    |
| 6     | Goederen    | 0.07%    |
| 7     | Gas         | 0.06%    |

## Client

### Bank

#### Events

- `financials:client:SetBankDisabled`
  - name, naam van de bank (komt overeen met naam in config)
  - isDisabled, Bool

### Cash

#### Exports

- `getCash`: Returned cash van speler, in JS/TS wordt er een Promise gereturnd

## Server

### Bank

#### Exports

- `createAccount`: Maak een bankrekening aan, return een Promise voor JS/TS returned
  - cid
  - name, Naam van de rekening
  - accountType, En van volgende String: 'standard', 'savings', 'business'
- `getDefaultAccount`: Haal een object op met de waarde van de standaard rekening, de waardes zijn equivalent aan de
  private fields van de Account class
  - cid
- `getDefaultAccountId`: Haalt de id van de standaard rekening op
  - cid
- `getAccountBalance`:
  - accountId
- `deposit`: Returned een Promise in JS/TS runtime
  - accountId
  - triggerCid, cid van de speler die deze in gang zet, dit kan verschillen van de owner van het account
  - amount
  - comment, optioneel
- `withdraw`: Returned een Promise in JS/TS runtime
  - accountId
  - triggerCid, cid van de speler die deze in gang zet, dit kan verschillen van de owner van het account
  - amount
  - comment, optioneel
- `transfer`: Returned een Promise in JS/TS runtime, deze promise resulteert in een boolean
  - accountId
  - targetAccountId
  - triggerCid, Persoon die vraagt voor een transactie uit te voeren, eg. de mechanieker
  - acceptorCid, Persoon die de transactie accepteert, eg. de klant
  - amount
  - comment, optioneel
  - taxId, optioneel, bekijk [Tax informatie](#tax-informatie) voor welke taxId je moet meegeven
- `purchase`: Returned een Promise in JS/TS runtime, deze promise resulteert in een boolean
  - accountId
  - triggerCid
  - amount
  - comment, optioneel
  - taxId, optioneel, bekijk [Tax informatie](#tax-informatie)
- `paycheck`: Returned een Promise in JS/TS runtime, deze promise resulteert in een boolean, Deze actie is voorbehouden voor het uitbetalen van een paycheck aan een speler, Het registeren van een paycheck voor een job staat verder in deze docs
  - accountId
  - triggerCid
  - amount
#### Events

- `financials:server:account:create`: (equivalent aan createAccount export)
  - cid
  - name, Naam van de rekening
  - accountType, En van volgende String: 'standard', 'savings', 'business'

#### Callbacks

- `financials:server:account:get`: Haalt alle accounts op van de speler, Dit zijn gestript varianten van de Account
  class met gebuilde permissions
- `financials:accounts:open`: Basisinfo voor UI
  - name, Naam van de plaats
- `financials:getDefaultAccount`: Equivalent aan getDefaultAccount maar returned de client version van de Account class
- `financials:server:action:deposit`: Gelijk aan de gelijknamige export, maar neemt 1 argument dat een object met volgende waardes is
  - accountId
  - amount
  - comment, Optioneel
- `financials:server:action:withdraw`: Gelijk aan de gelijknamige export, maar neemt 1 argument dat een object met volgende waardes is
  - accountId
  - amount
  - comment, Optioneel
- `financials:server:action:transfer`: Gelijk aan de gelijknamige export, maar neemt 1 argument dat een object met volgende waardes is, Deze callback ondersteunt geen acceptorCid, Als je dit nodig hebt moet je de export gebruiken
  - accountId
  - amount
  - target
  - comment, Optioneel
- `financials:server:transactions:get`: Haalt de transacties van het gespecifieerde account op van de meegegeven offset, in de callback geef je 1 object met volgende waardes mee:
  - accountId
  - offset, De offset vanwaar de transacties opgehaald worden

### Cash
#### Exports
- `getCash`: Returned cash van speler, in JS/TS wordt er een Promise gereturnd
  - source
- `removeCash`:
  - source
  - amount
  - comment, Als er geen comment meegegeven wordt, wordt deze automatisch gegenereerd en geflagged door de AC (TODO)
- `addCash`: 
  - source
  - amount
  - comment, Als er geen comment meegegeven wordt, wordt deze automatisch gegenereerd en geflagged door de AC (TODO)

#### Callbacks
- `financials:server:cash:get`: Returned cash van speler

### Crypto

#### Exports
- `cryptoBuy`: 
  - src
  - coin, De naam van de crypto die ingekocht moet worden
  - amount
- `cryptoAdd`: Gebruikt in scripts om een crypto toe te voegen aan de speler
  - src
  - coin, De naam van de crypto die toegevoegd moet worden
  - amount
  - comment

#### Callbacks
- `financials:server:crypto:getInfo`: Returned array met info over alle coins plus de bijhorende wallet voor de speler
- `financials:server:crypto:transfer`: Volgende waardes dienen in een object te steken die als parameter meegegeven moeten worden
  - coin
  - target, CID van de persoon die de crypto moet receiven
  - amount
- `financials:server:crypto:buy`: Volgende waardes dienen in een object te steken die als parameter meegegeven moeten worden
  - coin
  - amount

### Debts

Fines moeten binnen 7 dagen betaald worden, deze waarde is niet aanpasbaar voor een aparte fine,

#### Exports
- `giveFine`
  - cid
  - target_account
  - fine
  - reason
  - given_by

#### Callbacks

- `financials:server:debts:get`: Returned een object met een lijst onder de keys: `debts` en `maintenance`
- `financials:server:debts:pay`: Returned een boolean
  - DebtId

### Paycheck

#### Exports
- registerPaycheck
  - source
  - amount
  - job, Kan elke mogelijke string zijn, is enkel voor log purposes
  - comment, optioneel

#### Events
- `financials:server:paycheck:give`: Geeft een paycheck aan een speler als deze zich in pacific zone bevindt

### Taxes

#### Exports
- `getTaxedPrice`: Returned een object met volgende keys: `taxPrice`, `taxRate`
  - price
  - taxId

#### Callbacks
- `financials:server:taxes:calc`: Returned zelfde object al bovenstaande export en neemt 1 object met volgende waardes als params:
  - price
  - taxId
