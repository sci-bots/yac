const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

let options = {stdio: 'inherit', shell: true};

module.exports = (cwd=undefined, packageLocation) => {
  if (cwd == undefined) cwd = process.cwd();
  options.cwd = cwd;

  let activate;
  if (os.platform() == 'win32') {
    activate = `activate .\\yac_environment &&`;
  } else {
    activate = `source activate ./yac_environment &&`;
  }

  // Uninstall the package if it exists
  spawnSync(`${activate} conda develop ${packageLocation} --uninstall || true`, [], options);
  console.log("Uninstall complete");
}

if (require.main === module) {
  module.exports();
}
