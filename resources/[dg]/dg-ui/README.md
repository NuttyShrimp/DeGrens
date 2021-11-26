
# DG-UI

### Algemeen

De resource DG-UI zal als functie hebben alles wat er op je scherm gebeurt in het algemeen.
de recource zal bevatten:


- De algemene main CSS
- HUD
- Notificaties
- Meldingen

### Huisstijl

We hebben onze eigen stijl gebaseerd op de Material UI van Google

Hiervoor gebruiken we de hulp van Materialize CSS. Dit is hetzelfde principe zoals bootstrap. Meer info en de gebruikshandleining op deze link. [https://materializecss.com/](https://materializecss.com/)

Als er een UI bij een resource word gestoken kan je best de main CSS met voorgebouwde classes specifiek voor DeGrens importeren vanuit dg-ui. Hierin kan ja voorgebouwde classes vinden voor onderandere: buttons, kaders, inputs, Grid system, ...

Voor specifieke styling voor die bepaalde resource mag dit blijven in een stylesheet in de resource zelf. Dit gaat dan over de algemen positionering en de Display none/block voor dat bepaald script (bv. de positie van de taxi meter ope het scherm)

**dgstyle.css**
```html
<link href="https://cfx-nui-dg-ui/html/css/dgstyle.css" rel="stylesheet">
```
import van de hoofd styling

##### CSS Classes

```css
.dgBox 
```

```css
.dgInnerBox 
```

```css
.dgButton
```

```css
.dgButton-red
```

```css
.dgButton-green
```

```css
.dgButton
```

### Dependencies
```
ensure dg-core
ensure dg-chars
ensure dg-spawn
ensure dg-apartments
ensure qb-clothing
ensure dg-weathersync
```

##### Resource Dev
- Synergie


