const {spawn} = require('child_process');
const yacTrack = require('@yac/track');
const yacManager = require('@yac/process-management');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sha256 = require('sha256');
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
    const projects = yacManager.getRunningProjects();
    const hash = sha256(JSON.stringify(projects));
    res.send(JSON.stringify({projects, hash}));
  });

  app.post('/start', async (req, res) => {
    try {
      const p = req.body;
      if (p.pid == undefined) {
        const pid = yacManager.launchProject(p);
        res.send(`${pid}`);
      } else {
        yacManager.terminateProject(p).then((d) => {
          res.send('done');
        });
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
