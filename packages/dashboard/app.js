const {spawn} = require('child_process');
const yacTrack = require('@yac/track');
const yacExec = require('@yac/exec');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sha256 = require('sha256');
const terminate = require('terminate');
const _ = require('lodash');

const options = {stdio: 'inherit', shell: true};

module.exports = (cwd=undefined, port=8009) => {
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();
  const app = express();
  const pids = [];
  app.use(bodyParser.json());

  app.use(express.static(path.resolve(__dirname, 'public')))
  app.get('/', (req, res) => res.send('Hello World!'))
  app.get('/yacInfo.json', (req, res) => {
    const info = yacTrack.getInfo();
    let projects = _.map(info.yacProjects, (p) => {
      return _.find(pids, {name: p.name, path: p.path}) || p;
    });
    projects = JSON.stringify(projects);
    const hash = sha256(projects);
    res.send(JSON.stringify({projects, hash}));
  });
  app.post('/start', async (req, res) => {
    try {
      const p = req.body;
      if (p.pid == undefined) {
        const pkgJson = require(path.resolve(p.path, 'package.json'));
        if (pkgJson.main == undefined) throw`
          Yac project missing "main" in package.json.
          path: ${p.path}
          name: ${p.name}
        `;
        const child = yacExec(p.path, pkgJson.main, false);
        pids.push(_.extend(p, {pid: child.pid}));
        res.send(`${child.pid}`);
      } else {
        _.remove(pids, {pid: p.pid});
        let err = await new Promise((r,b) => {terminate(p.pid, (e)=>r(e))});
        if (err) throw err;
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.toString() });
    }
  });

  app.listen(port, () => console.log(`Yac dashboard running on port ${port}`));
}

if (require.main === module) {
  module.exports();
}
