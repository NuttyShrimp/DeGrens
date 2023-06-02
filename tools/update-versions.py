import os
import json
import re
from git.repo import Repo
from pathlib import Path

CHANGELOG_PLACEHOLDER="""
## [Unreleased]

### Added

### Changed

### Fixed
"""

TYPESCRIPT_FOLDERS = [
  'typescript',
  '*src*'
]

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

def findPackageJsons(root, depth=0):
  if depth > 3:
    return

  entries = [x for x in os.scandir(root) if "node_modules" not in str(x)]
  for entry in entries:
    if entry.is_file() and entry.name == "package.json":
      updateVersionInFile(newVersion, entry.path)
    elif entry.is_dir():
      findPackageJsons(entry.path, depth+1)


def updateVersions(version):
    for tsFolder in TYPESCRIPT_FOLDERS:
        for path in Path("resources/[dg]/").resolve().glob(f'*/{tsFolder}'):
            findPackageJsons(path)
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