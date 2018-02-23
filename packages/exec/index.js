const os = require('os');
const {spawn, spawnSync} = require('child_process');

let options = {stdio: 'inherit', shell: true};

module.exports = (cwd=undefined, cmd, sync=true) => {
  if (cwd == undefined) cwd = process.cwd();
  options.cwd = cwd;

  if (os.platform() == 'win32') {
    cmd = `activate .\\yac_environment && ${cmd}`;
  } else {
    cmd = `source activate ./yac_environment && ${cmd}`;
  }

  console.log("Executing: ", cmd);

  let child;
  if (sync == true) child = spawnSync(cmd, [], options);
  if (sync != true) child = spawn(cmd, [], options);

  return child;
}

if (require.main === module) {
  module.exports();
}
