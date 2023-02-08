/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const allLogTypes = new Set();

function findAllLogtypes(dir) {
  const allPathsInDir = fs.readdirSync(dir);
  for (const pathInDir of allPathsInDir) {
    const absolutePath = path.join(dir, pathInDir);
    // if path is folder let recursion handle it
    if (fs.statSync(absolutePath).isDirectory()) {
      findAllLogtypes(absolutePath);
      continue;
    }
    // Read ts/lua files and find logtype
    if (pathInDir.endsWith('lua') || pathInDir.endsWith('ts')) {
      const fileText = fs.readFileSync(absolutePath, 'utf-8');
      const logTypes = [...fileText.matchAll(/\bUtil.Log\b\([\n\r\s]*('|")\s*([^'"]*)/g)].map(r => r[2]);
      for (const logType of logTypes) {
        allLogTypes.add(logType);
      }
    }
  }
}

findAllLogtypes('./resources');
const jsonString = JSON.stringify([...allLogTypes], undefined, 2);
fs.writeFile('./logtypes.json', jsonString, err => err && console.error(err));

// run 'node tools/find-logtypes.js' from repo root
