import os
import json
import re
from git.repo import Repo
from pathlib import Path

CHANGELOG_PLACEHOLDER="""
## [Unreleased]

## Added

## Changed

## Fixed
"""

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

    with open("./CHANGELOG.md", "r+") as f:
      changelog = f.readlines();
      
      versionLine = 0
      for line in changelog:
        if line.startswith("## [Unreleased]"):
          break
        versionLine += 1

      if versionLine == 0:
        print("No '##[Unreleased] gevonden in de CHANGELOG.md file'")
        return

      changelog[versionLine] = f"## [{newVersion}]\n"
      changelog.insert(versionLine-1, CHANGELOG_PLACEHOLDER)

      f.seek(0)
      f.truncate()
      f.write("".join(changelog))

    
    repo = Repo(".")
    repo.index.add([item.a_path for item in repo.index.diff(None)])
    repo.index.commit(f"chore: bump version to v{version}")
    new_tag = repo.create_tag(f"v{version}") 
    repo.remotes.origin.push(new_tag.path)
    repo.remotes.origin.push()


statMainPackage()
newVersion = input("What version are we moving to? ")
if not re.match("^\d+\.\d+\.\d+$", newVersion):
    raise AssertionError("You version does not match the pattern, eg. 1.0.0")

updateVersions(newVersion)