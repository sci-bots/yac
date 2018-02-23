const fs = require('fs');
const path = require('path');
const os = require('os');
const _ = require('lodash');

const yackTrack = require('@yac/track');

module.exports = (cwd=undefined, ) => {
  /* Un-track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

  const yacInfo = yackTrack.getInfo();
  const pkgJSON = require(path.resolve(cwd, 'package.json'));
  const pkgName = pkgJSON.name;

  const pkgToRemove = _.find(yacInfo.yacProjects, {name: pkgName, path: cwd});
  if (pkgToRemove == undefined) throw `
    Could not find package:
    path: ${cwd}
    name: ${pkgName}
  `;

  console.log("Removing the following project:");
  console.log(`
    path: ${cwd}
    name: ${pkgName}
  `);

  _.remove(yacInfo.yacProjects, pkgToRemove);
  yackTrack.writeInfo(yacInfo);
  console.log(`Project ${pkgName} is no longer being tracked`);
}

if (require.main === module) {
  module.exports();
}
