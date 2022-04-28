import fnmatch
import os
import re
import sys

CLIENT_RESOURCE = '@dg-logs/client/cl_log.lua'

missingResources = []


def inWriteMode():
    for line in sys.argv:
        if line == '-w':
            return True
    return False


def check_manifest(path):
    with open(path, 'r+') as manifest:
        lines = manifest.readlines()
        hasLuaClientScript = False
        inClientObject = False
        # check if manifest has client resource
        for line in lines:
            if re.match(r'client_scripts?', line):
                if (re.match(r'client_scripts?\s*\{', line)):
                    inClientObject = True
                if (re.match(r'\.lua', line)):
                    hasLuaClientScript = True
            if inClientObject and re.match(r'\}', line):
                inClientObject = False
            # if in object and file ends in lua, add client resource
            if inClientObject and re.match(r'.*\.lua.*', line):
                hasLuaClientScript = True
            if CLIENT_RESOURCE in line:
                return
        if not hasLuaClientScript:
            return
        # if not, add it
        if inWriteMode():
            manifest.write(f'\nclient_script "{CLIENT_RESOURCE}"\n')
        else:
            # Represents the relative path in the resources/[dg]/ folder
            resourceName = path.replace(
                os.path.abspath("./resources/[dg]/"), '')[1:].split('/')[0]
            missingResources.append(resourceName)
            print(
                f"{resourceName} is missing the error logger for the client")


def main():
    # No glob bcs that shit slow
    for dirpath, dirs, files in os.walk(os.path.abspath("./resources/[dg]/")):
        for filename in fnmatch.filter(files, 'fxmanifest.lua'):
            check_manifest(os.path.join(dirpath, filename))

    exit(0 if len(missingResources) == 0 else 1)


if __name__ == "__main__":
    main()
