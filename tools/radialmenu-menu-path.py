import os
import re

def getSubModTree(subMod, indent=0):
  modStr=''
  whiteSpaces = ''.join([' ' for _ in range(indent)])
  indent += 4
  with open(os.path.abspath(f'../resources/[dg]/dg-radialmenu/client/entries/cl_{subMod}.lua')) as file:
    fileLines = file.readlines()
    for i in range(0,len(fileLines)):
      line = fileLines[i]
      if re.match(r'^\s*subMenu ?= ?[\'"](.*)[\'"]', line):
        matches = re.findall(r'subMenu ?= ?[\'"](.*)[\'"]', line)
        if len(matches) < 1:
          continue
        menuName = re.sub(r'subMenu ?= ?[\'"](.*)[\'"]', '\1', matches[0])
        titleName = 'Not Found'
        for j in range(i, 0, -1):
          titleLine = fileLines[j]
          print(titleLine)
          if re.match(r'^\s*title ?= ?[\'"](.*)[\'"]', titleLine):
            matches = re.findall(r'title ?= ?[\'"](.*)[\'"]', titleLine)
            if len(matches) < 1:
              continue
            titleName = re.sub(r'title ?= ?[\'"](.*)[\'"]', '\1', matches[0])
            break

        modStr += f'{whiteSpaces}├── {titleName}({menuName})\n'
        modStr += getSubModTree(menuName, indent)

  return modStr


def main():
  treeStr = 'main\n'
  treeStr += getSubModTree('main')
  print(treeStr)

if __name__ == '__main__':
  main()