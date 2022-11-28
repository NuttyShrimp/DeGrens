import fnmatch
import os
import re
import sys

CLIENT_RESOURCE = '@dg-logs/client/cl_log.lua'
SERVER_RESOURCE = '@dg-logs/server/sv_log.lua'
DEPENDENCIES = {
  "skipped": ['dg-config', 'dg-auth'],
  "entries":  ['dg-auth']
}

missingResources = []


def inWriteMode():
  for line in sys.argv:
    if line == '-w':
      return True
  return False

def check_dependencies(path, dep):
  with open(path, 'r+') as manifest:
    lines = manifest.readlines()
    inObject = False
    for line in lines:
      if re.match(r'dependenc(ies)?', line):
        if (re.match(r'%dependencies?\s*\{', line)):
          inObject = True
      if inObject and re.match(r'\}', line):
        inObject = False
      if dep in line:
        return
    if inWriteMode():
      manifest.write(f'\ndependency "{dep}"\n')
    else:
      # Represents the relative path in the resources/[dg]/ folder
      resourceName = path.replace(
        os.path.abspath("./resources/[dg]/"), '')[1:].split('/')[0]
      missingResources.append(resourceName)
      print(
        f"{resourceName} is missing the {dep} dependency")


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
      manifest_path = os.path.join(dirpath, filename)
      check_manifest(manifest_path, 'client', CLIENT_RESOURCE)
      check_manifest(manifest_path, 'server', SERVER_RESOURCE)
      if len([ skipRes for skipRes in DEPENDENCIES['skipped'] if skipRes in dirpath ]) != 0:
        continue
      for dep in DEPENDENCIES['entries']:
        check_dependencies(manifest_path, dep)

  exit(0 if len(missingResources) == 0 else 1)


if __name__ == "__main__":
  main()
