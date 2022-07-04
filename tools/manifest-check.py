import fnmatch
import os
import re
import sys

CLIENT_RESOURCE = '@dg-logs/client/cl_log.lua'
SERVER_RESOURCE = '@dg-logs/server/sv_log.lua'

missingResources = []


def inWriteMode():
  for line in sys.argv:
    if line == '-w':
      return True
  return False


def check_manifest(path, side, logger):
  with open(path, 'r+') as manifest:
    lines = manifest.readlines()
    hasLuaScript = False
    inObject = False
    # check if manifest has resource
    for line in lines:
      if re.match(r'%s_scripts?' %side, line):
        if (re.match(r'%s_scripts?\s*\{' %side, line)):
          inObject = True
        if (re.match(r'\.lua', line)):
          hasLuaScript = True
      if inObject and re.match(r'\}', line):
        inObject = False
      # if in object and file ends in lua, add resource
      if inObject and re.match(r'.*\.lua.*', line):
        hasLuaScript = True
      if logger in line:
        return
    if not hasLuaScript:
      return
      # if not, add it
    if inWriteMode():
      manifest.write(f'\n{side}_script "{logger}"\n')
    else:
      # Represents the relative path in the resources/[dg]/ folder
      resourceName = path.replace(
        os.path.abspath("./resources/[dg]/"), '')[1:].split('/')[0]
      missingResources.append(resourceName)
      print(
        f"{resourceName} is missing the {side} error logger")


def main():
  # No glob bcs that shit slow
  for dirpath, dirs, files in os.walk(os.path.abspath("./resources/[dg]/")):
    if 'dg-logs' in dirpath:
      continue
    for filename in fnmatch.filter(files, 'fxmanifest.lua'):
      check_manifest(os.path.join(dirpath, filename), 'client', CLIENT_RESOURCE)
      check_manifest(os.path.join(dirpath, filename), 'server', SERVER_RESOURCE)

  exit(0 if len(missingResources) == 0 else 1)


if __name__ == "__main__":
  main()
