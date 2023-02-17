import sys
from pathlib import Path
import os
import json

newIncludeFolder = sys.argv[1]
targetFolder = sys.argv[2]

assert(os.path.exists(newIncludeFolder))
assert(os.path.exists(targetFolder))
includeFolderPath = os.path.abspath(newIncludeFolder)

for path in Path(targetFolder).rglob('tsconfig.json'):
    print(f"Modifying {path.absolute()}")
    parentAbs = path.parent.absolute()
    newRelInclude = os.path.relpath(includeFolderPath, parentAbs)
    print(f"adding {newRelInclude} to include")
    
    with open(path.absolute(), "r+") as f:
        tsconf = json.loads("\n".join(f.readlines()))
        f.seek(0)
        tsconf["include"].append(str(newRelInclude))
        tsconf_str = json.dumps(tsconf, indent=2)
        f.write(tsconf_str)