import json
import os

CMDS = {"build prod": 'build', "build dev": "build:dev", "watch": "watch"}
CMDOrder = ["build prod", "build dev", "dev", "watch"]
VSCodeConfig = {}


def getAllTSResources():
  resources = []
  dgResRoot = os.path.abspath("./resources/[dg]/")
  for dir in os.listdir(dgResRoot):
    if not os.path.isdir(os.path.join(dgResRoot, dir)) or dir == 'ts-shared':
      continue
    for subdir in os.listdir(os.path.join(dgResRoot, dir)):
      if subdir == 'typescript':
        resources.append(dir.replace('dg-', ''))
  return resources


# region config generators
def buildIdeaConfig(resource, cmdName):
  ideaConfig = f"""
  <component name="ProjectRunConfigurationManager">
    <configuration default="false" name="{resource}:{cmdName}" type="js.build_tools.npm" folderName="{resource}">
      <package-json value="$PROJECT_DIR$/resources/[dg]/dg-{resource}/typescript/package.json" />
      <command value="run" />
      <scripts>
        <script value="{CMDS[cmdName]}" />
      </scripts>
      <node-interpreter value="project" />
      <envs />
      <method v="2">
        <option name="NpmBeforeRunTask" enabled="true">
          <package-json value="$PROJECT_DIR$/resources/[dg]/dg-{resource}/typescript/package.json" />
          <command value="run" />
          <scripts>
            <script value="lint" />
          </scripts>
          <node-interpreter value="project" />
          <envs />
        </option>
      </method>
    </configuration>
  </component>
  """
  with open(f".idea/runConfigurations/{resource}_{cmdName.replace(' ', '_')}.xml", "w") as f:
    f.write(ideaConfig)


def buildVSCodeJson(resource, cmdName):
  global VSCodeConfig
  VSCodeConfig["configurations"].append(
    {
      "type": "node-terminal",
      "name": f"{resource}:{cmdName}",
      "request": "launch",
      "command": f"pnpm run {CMDS[cmdName]}",
      "cwd": "${workspaceFolder}/resources/[dg]/dg-%s/typescript" % resource
    }
  )


# endregion

def isResPresentInVscode(resource, cmd):
  global VSCodeConfig
  for config in VSCodeConfig["configurations"]:
    if config["name"] == f"{resource}:{cmd.replace(':', ' ')}":
      return True
  return False


def addMissingConfigs(resource):
  for cmd in CMDS.keys():
    if not os.path.exists(f"./.idea/runConfigurations/{resource}_{cmd.replace(' ', '_')}.xml"):
      buildIdeaConfig(resource, cmd)
      print('[IDEA] Added config for %s:%s' % (resource, cmd))
    if not isResPresentInVscode(resource, cmd):
      buildVSCodeJson(resource, cmd)
      print('[VSCODE] Added config for %s:%s' % (resource, cmd))


def loadVSCodeJson():
  global VSCodeConfig
  with open("./.vscode/launch.json", "r") as f:
    VSCodeConfig = json.load(f)


def writeVSCodeJson():
  global VSCodeConfig
  global CMDOrder
  # Sort by name.split(':')[0] + position of name.split(':')[1] in CMDS
  newConfigs = [] 
  for config in VSCodeConfig["configurations"]:
    name = config["name"]
    res = name.split(':')[0]
    cmd = name.split(':')[1]
    idxToInsert = len(newConfigs)
    for i, exConfig in enumerate(newConfigs):
      # Split at last : everything before the last : is the resource name
      exRes = ":".join(exConfig["name"].split(':')[:-1])
      exCmd = exConfig["name"].split(':')[-1]
      if res < exRes:
        idxToInsert = i
        break
      # Sort on order in CMDOrder
      if res == exRes and CMDOrder.index(cmd) < CMDOrder.index(exCmd):
        idxToInsert = i
        break
    newConfigs.insert(idxToInsert, config)
  VSCodeConfig["configurations"] = newConfigs
  with open("./.vscode/launch.json", "w") as f:
    json.dump(VSCodeConfig, f, indent=2)


if __name__ == "__main__":
  loadVSCodeJson()
  TSResources = getAllTSResources()
  for resource in TSResources:
    addMissingConfigs(resource)
  writeVSCodeJson()
