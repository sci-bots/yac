const fs = require('fs');
const path = require('path');
const os = require('os');

const request = require('request');
const _ = require('lodash');

let FILE_LOCATION = path.resolve(__dirname, 'yacinfo.json');
let OPTIONS = {url: false};

const setFileLocation = (fileLocation, options=OPTIONS) => {
  /* Set file location and update options */

  if (options.url != true) {
    if (fileLocation != undefined) fileLocation = path.resolve(fileLocation);
    FILE_LOCATION = fileLocation || path.resolve(__dirname, 'yacinfo.json');
  } else {
    // If url, do not path validation
    FILE_LOCATION = fileLocation;
  }
  OPTIONS = options;
}

const add = (cwd=undefined, yacInfoFile=FILE_LOCATION, options=OPTIONS) => {
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

  let yacInfo = {};

  if (options.url != true) {
    // Get yac info from yacinfo.json
    if (!fs.existsSync(yacInfoFile)) {
      yacInfo.yacProjects = [];
      fs.writeFileSync(yacInfoFile, JSON.stringify(yacInfo, null, 4));
    } else {
      yacInfo = JSON.parse(fs.readFileSync(yacInfoFile));
    }
  } else {
    request(yacInfoFile, (err, res, body) => {
      yacInfo = JSON.parse(body);
    });
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
  if (options.url != true) {
    fs.writeFileSync(yacInfoFile, JSON.stringify(yacInfo, null, 4));
    console.log(`Tracking project ${pkgJSON.name} in ${cwd}`);
  } else {

    return new Promise((resolve, reject) => {
      const options = {
        method: 'post', url: yacInfoFile, body: yacInfo, json: true
      };
      request(options, (err, res, body) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

module.exports = setFileLocation;
module.exports.setFileLocation = setFileLocation;
module.exports.add = add;

module.exports.getInfo = (yacInfoFile=FILE_LOCATION, options=OPTIONS) => {
  if (options.url != true) {
    if (!fs.existsSync(yacInfoFile)) {
      return {yacProjects: []};
    } else {
      return JSON.parse(fs.readFileSync(yacInfoFile));
    }
  } else {
    return new Promise((resolve, reject) => {
      request(yacInfoFile, (err, res, body) => {
        resolve(JSON.parse(body));
      });
    });
  }
}

module.exports.writeInfo = (info, yacInfoFile=FILE_LOCATION, options=OPTIONS) => {
  if (options.url != true) {
    fs.writeFileSync(yacInfoFile, JSON.stringify(info, null, 4));
  } else {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'post', url: yacInfoFile, body: info, json: true
      };
      request(options, (err, res, body) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

if (require.main === module) {
  module.exports();
}
