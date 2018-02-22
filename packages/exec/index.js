const os = require('os');
const {spawnSync} = require('child_process');

let options = {stdio: 'inherit', shell: true};

module.exports = (cwd=undefined, cmd) => {
  if (cwd == undefined) cwd = process.cwd();
  options.cwd = cwd;

  if (os.platform() == 'win32') {
    cmd = `activate .\\yac_environment ; ${cmd}`;
  } else {
    cmd = `source activate ./yac_environment && ${cmd}`;
  }

  console.log("Executing: ", cmd);
  spawnSync(cmd,[], options);
}

if (require.main === module) {
  module.exports();
}
