const os = require('os');
const {spawn, spawnSync} = require('child_process');

const env = process.env;
env["PYTHONUNBUFFERED"] = 1;

let options = {stdio: 'inherit', shell: true, env: env};

module.exports = (cwd=undefined, cmd, sync=true, inherit=true) => {
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
  if (sync != true) {
    if (inherit == false) options.stdio = 'pipe';
    child = spawn(cmd, [], options);
  }

  return child;
}

if (require.main === module) {
  module.exports();
}
