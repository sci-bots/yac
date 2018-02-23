const fs = require('fs');
const path = require('path');
const os = require('os');

const _ = require('lodash');

module.exports = (cwd=undefined) => {
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

  const yacInfoFile = path.resolve(__dirname, 'yacinfo.json');
  let yacInfo = {};

  // Get yac info from yacinfo.json
  if (!fs.existsSync(yacInfoFile)) {
    yacInfo.yacProjects = [];
    fs.writeFileSync(yacInfoFile, JSON.stringify(yacInfo, null, 4));
  } else {
    yacInfo = JSON.parse(fs.readFileSync(yacInfoFile));
  }

  // Check if the package already exists:
  let project = _.find(yacInfo.yacProjects, {path: cwd});
  if (project != undefined) throw `
    A project already exists in this location:
    path: ${project.path}
    name: ${project.name}
  `;

  // Check if directory is a valid yac project:
  let isValid = fs.existsSync(path.resolve(cwd, "environment.yml"));
  if (!isValid) throw `
    Not a valid yac project. Missing environment.yml file in
    ${cwd}
  `;
  const pkgJSON = require(path.resolve(cwd, "package.json"));
  isValid = _.includes(pkgJSON.keywords, 'yac-project');
  if (!isValid) throw `
    Not a valid yac project. The package.json file in ${cwd}
    should contain "keywords": ["yac-project"]
  `;

  // Add project to yacinfo.json
  yacInfo.yacProjects.push({name: pkgJSON.name, path: cwd});
  fs.writeFileSync(yacInfoFile, JSON.stringify(yacInfo, null, 4));
  console.log(`Tracking project ${pkgJSON.name} in ${cwd}`);

}

if (require.main === module) {
  module.exports();
}
