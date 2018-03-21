const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

let options = {stdio: 'inherit', shell: true};

module.exports = (cwd=undefined, packageName, type, channel) => {
  if (cwd == undefined) cwd = process.cwd();
  options.cwd = cwd;

  console.log({type, packageName});

  let cmd;
  if (type == 'conda') {
    cmd = `conda install ${channel ? '-c ${channel}' : ''} ${packageName}`;
  } else if (type == 'pip') {
    cmd = `pip install ${packageName}`
  } else {
    throw `Invalid type ${type}. yac currently support conda and pip.`
  }

  let activate;
  if (os.platform() == 'win32') {
    activate = `activate .\\yac_environment &&`;
  } else {
    activate = `source activate ./yac_environment &&`;
  }

  // Execute install command:
  spawnSync(`${activate} ${cmd}`, [], options);

  // Update environment.yml file
  const prefix = path.resolve(cwd, 'yac_environment');
  console.log(`conda env export -p ${prefix} > environment.yml`);
  spawnSync(`conda env export -p ${prefix} > environment.yml`, [], options);
}

if (require.main === module) {
  module.exports();
}
