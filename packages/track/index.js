const fs = require('fs');
const path = require('path');
const os = require('os');

const _ = require('lodash');

let FILE_LOCATION = path.resolve(__dirname, 'yacinfo.json');

const setFileLocation = (fileLocation) => {
  if (fileLocation != undefined) fileLocation = path.resolve(fileLocation);
  FILE_LOCATION = fileLocation || path.resolve(__dirname, 'yacinfo.json');
}

const add = (cwd=undefined, yacInfoFile=FILE_LOCATION) => {
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

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

module.exports = setFileLocation;
module.exports.setFileLocation = setFileLocation;
module.exports.add = add;

module.exports.getInfo = (yacInfoFile=FILE_LOCATION) => {
  if (!fs.existsSync(yacInfoFile)) {
    return {yacProjects: []};
  } else {
    return JSON.parse(fs.readFileSync(yacInfoFile));
  }
}

module.exports.writeInfo = (info, yacInfoFile=FILE_LOCATION) => {
  fs.writeFileSync(yacInfoFile, JSON.stringify(info, null, 4));
}

if (require.main === module) {
  module.exports();
}
