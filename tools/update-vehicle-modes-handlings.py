import json
import xml.etree.ElementTree as ET
import xmltodict
from decimal import *

vehClasses = [
  "x",
  "s",
  "a+",
  "a",
  "b",
  "c",
  "d"
]

handlings = dict()
upgrades = dict()

upgradedHandlings = dict()

getcontext().prec = 7

tree = ET.parse("./resources/[vehicles]/vehicleconfig/handling.meta")
root = tree.getroot()
for item in root[0]:
  handlingName = item.findtext("handlingName")
  if not handlingName:
    continue 
  handlings[handlingName.lower()] = xmltodict.parse(ET.tostring(item, encoding='utf8', method='xml'))['Item']

for name in handlings:
  for vehClass in vehClasses:
    if f"{name}_{vehClass}" not in handlings:
      continue
    if name not in upgrades:
      upgrades[name] = []
    upgrades[name].append(f"{name}_{vehClass}")

for baseClass in upgrades:
  baseHandling = handlings[baseClass]
  diffHandlins = {}
  for handlingKey in baseHandling:
    if handlingKey in ["handlingName", 'SubHandlingData'] :
      continue
    baseValue = baseHandling[handlingKey]

    if "@value" not in baseValue:
      continue

    for upgradeClass in upgrades[baseClass]:
      upgradedHandling = handlings[upgradeClass]
      upgradeClass = upgradeClass.replace(f"{baseClass}_", "")
      if baseValue != upgradedHandling[handlingKey]:
        if baseClass not in upgradedHandlings:
          upgradedHandlings[baseClass] = {}
        if upgradeClass not in upgradedHandlings[baseClass]:
          upgradedHandlings[baseClass][upgradeClass] = {}
        upgradedHandlings[baseClass][upgradeClass][handlingKey] = float(Decimal(upgradedHandling[handlingKey]['@value']) - Decimal(baseValue['@value']))
        
for model in upgradedHandlings:
  with open(f"./resources/[dg]/dg-config/configs/vehicles/handlings/{model}.json","w") as f:
    f.write(json.dumps(upgradedHandlings[model], indent=2))