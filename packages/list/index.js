const fs = require('fs');
const path = require('path');
const os = require('os');
const _ = require('lodash');
const yacTrack = require('@yac/track');

module.exports = (cwd=undefined) => {
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

  const yacInfo = yacTrack.getInfo();
  const str = _.map(yacInfo.yacProjects, (p) => `${p.name}: ${p.path}` ).join('\n');
  console.log(`
Yac Projects:
${str}
  `);
}

if (require.main === module) {
  module.exports();
}
