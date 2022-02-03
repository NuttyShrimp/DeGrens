# dg-polyzone

Dit script is een event base polyzone wrapper. Je kunt dus via exports je polyzone aanmaken en deze zal dan ge "watched"
worden door onze combozone Voor meer info rondt het aanmaken van polyzone stuur ik u
naar [hier](https://github.com/mkafrin/PolyZone/wiki).

Volgende exports zijn beschikbaar vanuit deze module:

- AddBoxZone
- AddCircleZone
- AddPolyZone

Ik raad je aan om in het script zelf te kijken voor meer info ivm welke argumenten er mee gegeven moeten worden. Ik raad
wel aan om in de options table een data table met een unique id per zone mee te geven. zo kun je meerdere zones aanmaken
onder dezelfde naam maar ze toch elke identificeren. Deze id zal er ook voor zorgen dat een zone niet 2x zal aangemaakt
worden mocht u bv. het script herstarten