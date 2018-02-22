const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

let options = {stdio: 'inherit', shell: true};

module.exports = (cwd=undefined, packageLocation, packageName) => {
  if (cwd == undefined) cwd = process.cwd();
  if (packageName == undefined) packageName = path.basename(packageLocation);
  options.cwd = cwd;

  let activate;
  if (os.platform() == 'win32') {
    activate = `activate .\\yac_environment &&`;
  } else {
    activate = `source activate ./yac_environment &&`;
  }

  // Uninstall the package if it exists
  console.log("Attempting to uninstall package (if exists)");
  spawnSync(`${activate} conda uninstall --force ${packageName} || true`, [], options);
  spawnSync(`${activate} pip uninstall ${packageName} || true`, [], options);
  console.log("Uninstall complete");

  // Link locally using conda dev
  console.log("Linking package location");
  console.log(path.resolve(packageLocation));
  spawnSync(`${activate} conda develop ${path.resolve(packageLocation)}`, [], options);

}

if (require.main === module) {
  module.exports();
}
