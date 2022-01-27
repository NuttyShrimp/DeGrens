# Cash

Replace the functions in the player module so everything is under the same resource.
The following functions are exposed:

## Get Cash

```lua
local cash = exports["dg-financials"]:getCash(source)
```

## Add Cash

If the reason is not provided, the action will be flagged as suspicious.

```lua
exports["dg-financials"]:addCash(source, amount, reason)
```

## Remove Cash

If the reason is not provided, the action will be flagged as suspicious.

```lua
isSuccess = exports["dg-financials"]:removeCash(source, amount, reason)
```
