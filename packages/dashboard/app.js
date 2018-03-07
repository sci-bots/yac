const http = require('http');
const {spawn} = require('child_process');
const yacTrack = require('@yac/track');
const yacManager = require('@yac/process-management');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sha256 = require('sha256');
const _ = require('lodash');
const WebSocket = require('ws');

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

const main = async (cwd=undefined, yacfile, options={port: PORT, url: false}) => {
  if (options.port == undefined) options.port = PORT;
  yacTrack.setFileLocation(yacfile, options);
  yacManager.setFileLocation(yacfile, options);

  /* Launch Yac Dashboard */
  env.port = options.port;

  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

  app = express();
  server = http.createServer(app);

  wss = new WebSocket.Server({ server });
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const pids = [];
  app.use(bodyParser.json());
  app.use(express.static(path.resolve(__dirname, 'public')))

  app.get('/logo', (req, res) => {
    res.sendFile(env.logo || path.resolve(__dirname, 'public/logo.png'));
  });

  app.get('/yacInfo.json', async (req, res) => {
    res.send(JSON.stringify(await info()));
  });

  setInterval( async ()=> {
    let _info = await info();
    let hash = sha256(JSON.stringify(_info));
    if (hash != prevHash) {
      prevHash = hash;
      wss.broadcast(JSON.stringify({topic: 'data', payload: _info}));
    }
  }, 1500);

  app.post('/stop', async (req, res) => {
    try {
      const p = req.body;
      const proj = _.find(await info(), {name: p.name, path: p.path});
      if (!proj) throw("Could not find project");
      if (!proj.pid) throw("Project is not running");
      stop(proj);
      res.send("done");
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.toString() });
    }
  });

  app.post('/start', async (req, res) => {
    try {
      const p = req.body;
      const proj = _.find(await info(), {name: p.name, path: p.path});
      console.log("STARTING!", {p, proj});
      if (!proj) throw("Could not find project");
      if (proj.pid) throw("Project already running");
      start(proj, async (log) => {
        wss.broadcast(JSON.stringify({topic: 'data', payload: await info()}));
      });
      res.send(`${proj.pid}`);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.toString() });
    }
  });

  //  Auto start plugins with autostart flag in yac info:
  const _info = await yacTrack.getInfo();
  _.each(_info.yacProjects, (proj) => {
    if (proj.autostart == true) {
      start(proj, (log) => {
        wss.broadcast(JSON.stringify({topic: 'data', payload: info()}));
      })
    }
  });

  server.listen(options.port, 'localhost', null, () => {
   console.log(`Yac dashboard running on port ${options.port}`) ;
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
