const http = require('http');
const {spawn} = require('child_process');
const yacTrack = require('@yac/track');
const yacManager = require('@yac/process-management');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sha256 = require('sha256');
const _ = require('lodash');
const io = require('socket.io');
const options = {stdio: 'inherit', shell: true};

let PORT=8009;
let prevHash = '';
let env = {};
let app, server, socket;

const addKeywordFilter = (keyword) => {
  env.keywordFilter = keyword;
}

const setLogo = (file) => {
  env.logo = file;
}

const info = () => {
  return yacManager.getRunningProjects(env.keywordFilter);
}

const start = (p, callback) => {
  /* Start Yac Project */
  if (p.pid != undefined) throw ("Plugin appears to be running");
  const pid = yacManager.launchProject(p, callback);
  return pid;
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

  app = express();
  server = http.createServer(app);
  socket = io(server);

  const pids = [];
  app.use(bodyParser.json());
  app.use(express.static(path.resolve(__dirname, 'public')))

  app.get('/logo', (req, res) => {
    res.sendFile(env.logo || path.resolve(__dirname, 'public/logo.png'));
  });

  app.get('/yacInfo.json', (req, res) => {
    res.send(JSON.stringify(info()));
  });

  setInterval(()=> {
    let _info = info();
    let hash = sha256(JSON.stringify(_info));
    if (hash != prevHash) {
      prevHash = hash;
      socket.emit('data', _info);
    }
  }, 1500);

  app.post('/stop', (req, res) => {
    try {
      const p = req.body;
      const proj = _.find(info(), {name: p.name, path: p.path});
      if (!proj) throw("Could not find project");
      if (!proj.pid) throw("Project is not running");
      stop(proj);
      res.send("done");
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.toString() });
    }
  });

  app.post('/start', (req, res) => {
    try {
      const p = req.body;
      const proj = _.find(info(), {name: p.name, path: p.path});
      if (!proj) throw("Could not find project");
      if (proj.pid) throw("Project already running");
      start(proj, (log) => {
        socket.emit('data', info());
      });
      res.send(`${proj.pid}`);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.toString() });
    }
  });

  server.listen(port, 'localhost', null, () => {
   console.log(`Yac dashboard running on port ${port}`) ;
 });

}

const url = () => {
  return `http://localhost:${env.port}`;
}

module.exports = main
module.exports.url = url;
module.exports.start = start;
module.exports.stop = stop;
module.exports.launchDashboard = main;
module.exports.setLogo = setLogo;
module.exports.addKeywordFilter = addKeywordFilter;

if (require.main === module) {
  module.exports();
}
