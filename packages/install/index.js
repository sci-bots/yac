const {spawnSync} = require('child_process');

const hasbin = require('hasbin');

const commands = {
  createEnv: "conda env create --force -f=./environment.yml -p ./yac_environment"
};

let options = {
  stdio: 'inherit', shell: true
};

module.exports = (cwd=undefined) => {
  if (!hasbin.sync('conda')) throw `
    Conda is not in path. Yac requires conda to manage its project environments.
    Please install conda globally (either through Miniconda or Anaconda),
    then try running "yac install" again.
  `;
  if (cwd == undefined) cwd = process.cwd();

  options.cwd = cwd;
  spawnSync(commands.createEnv, [], options);

  console.log(`
    Install complete!
    To execute commands from this environment use "yac exec"
  `);

}

if (require.main === module) {
  module.exports();
}
