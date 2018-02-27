const {spawn} = require('child_process');
const yacTrack = require('@yac/track');
const yacManager = require('@yac/process-management');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sha256 = require('sha256');
const _ = require('lodash');

const options = {stdio: 'inherit', shell: true};

let PORT=8009;
let env = {};


const info = () => {
  const projects = yacManager.getRunningProjects();
  const hash = sha256(JSON.stringify(projects));
  return {projects, hash};
}

const start = async (p) => {
  /* Start Yac Project */
  if (p.pid == undefined) {
    const pid = yacManager.launchProject(p);
    return pid;
  } else {
    return await stop(p);
  }
}

const stop = async (p) => {
  /* Stop Yac Project */
  await yacManager.terminateProject(p);
  return 'done';
}

const main = (cwd=undefined, port=PORT) => {
  /* Launch Yac Dashboard */
  env.port = port;
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();
  const app = express();
  const pids = [];
  app.use(bodyParser.json());

  app.use(express.static(path.resolve(__dirname, 'public')))

  app.get('/yacInfo.json', (req, res) => {
    res.send(JSON.stringify(info()));
  });

  app.post('/start', async (req, res) => {
    try {
      const p = req.body;
      start(p);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.toString() });
    }
  });

  app.listen(port, () => console.log(`Yac dashboard running on port ${port}`));
}

const url = () => {
  return `http://localhost:${env.port}`;
}

module.exports = main
module.exports.url = url;
module.exports.start = start;
module.exports.stop = stop;
module.exports.launchDashboard = main;

if (require.main === module) {
  module.exports();
}
