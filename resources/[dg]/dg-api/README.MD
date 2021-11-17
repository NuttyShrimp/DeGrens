# DG-API

basic api to retrieve incoming request,
For the sake of security only limited to POST requests

Het registeren van een route gaat via volgende export:
````lua
exports["dg-api"]:registerRoute(pathOfRoute, function(boyd)
  -- Do something with body
  return true
end)
````
Het is belangrijk dat de handler functie iets terugstuurt,
Als je geen data wilt terugsturen met de response kun je een boolean terugsturen die representeert hoe "goed" de functie verlopen is.
Mocht je liever data terugsturen diene je deze te returnen ipv je boolean.
Door nil of niks terug te sturen zal het systeem denken dat er iets fout is gelopen bij de handler (Error code 500)

Om de API te accessen zal je je request moeten sturen naar volgende URL `http://ipAddressVanFiveMSrv:30120/dg-api/path/to/request`

De verplichte API token dien je mee te geven in de body eg.
```json
{
  "token": "0ec834c2-ed57-4383-bb5f-cfd4f1f811d6"
}
```