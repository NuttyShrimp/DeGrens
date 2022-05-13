# DG-API

basic api to retrieve incoming request,

Het registeren van een route gaat via volgende export:
````lua
exports["dg-api"]:registerRoute(method, pathOfRoute, function(request, res)
  -- Do something with body
  res(200, {})
end)
````

Om de API te accessen zal je je request moeten sturen naar volgende URL `http://ipAddressVanFiveMSrv:30120/dg-api/path/to/request`

De Authentication wordt gedaan door een [_Bearer_ token](https://stackoverflow.com/questions/25838183/what-is-the-oauth-2-0-bearer-token-exactly). Deze dien je mee te geven in de header.

Om je eigen token te generen kun je de `createAPIToken` command gebruiken die gevolgd wordt door een optionele comment om meer info aan je token te geven.

`createAPIToken <Multi word comment>`