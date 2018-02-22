const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const hasbin = require('hasbin');

module.exports = (cwd=undefined) => {
  if (cwd == undefined) {
    cwd = process.cwd();
  }

  if (!hasbin.sync('yarn')) {
    throw(`
      Yac requires yarn.
      Please install yarn globally before initializing a yac project.
    `);
  }

  // Initialize a yarn project:
  // TODO: Move to our own scaffolder like yeoman or cookiecutter
  spawnSync(`yarn init`, [], {stdio: 'inherit', shell: true, cwd: cwd});
  const packageJson = require(path.resolve(`${cwd}/package.json`));

  // Add a "keywords" section containing "yac-project"
  if (packageJson.keywords == undefined) packageJson.keywords = [];
  if (packageJson.keywords.indexOf('yac-project') == -1) {
    packageJson.keywords.push("yac-project");
  }

  // Add "conda dependencies", and "pip dependencies" sections
  packageJson.condaDependencies = {};
  packageJson.pipDependencies = {};

  // Write packageJSON to file
  fs.writeFileSync(`${cwd}/package.json`, JSON.stringify(packageJson,null, 4));

  console.log(packageJson);
  console.log("Yac project successfully initialized!");
}

if (require.main === module) {
  module.exports();
}
