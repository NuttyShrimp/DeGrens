import os
import json
import re
from pathlib import Path


def statMainPackage():
    assert os.path.exists(
        "./package.json"), "this should be run with CWD in root"
    with open("./package.json") as f:
        packageObj = json.loads("".join(f.readlines()))
        assert packageObj["name"] == 'root', "This should be ran in the dg-2 repo root"


def updateVersionInFile(version, p):
    with open(p, "r+") as f:
        mainCfg = json.loads("".join(f.readlines()))
        mainCfg["version"] = version
        f.seek(0)
        f.truncate()
        f.write(json.dumps(mainCfg, indent=2))


def updateVersions(version):
    for path in Path("resources").rglob('package.json'):
        if "node_modules" in str(path):
            continue
        updateVersionInFile(version, path)
    for path in Path("packages").rglob('package.json'):
        if "node_modules" in str(path):
            continue
        updateVersionInFile(version, path)
    updateVersionInFile(version, "./package.json")
    updateVersionInFile(version, "./resources/[dg]/dg-config/configs/main.json")


statMainPackage()
newVersion = input("What version are we moving to? ")
if not re.match("^\d+\.\d+\.\d+$", newVersion):
    raise AssertionError("You version does not match the pattern, eg. 1.0.0")

updateVersions(newVersion)