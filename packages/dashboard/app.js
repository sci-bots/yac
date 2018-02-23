const yacTrack = require('@yac/track');
const path = require('path');
const express = require('express');

module.exports = (cwd=undefined, port=8009) => {
  /* Track the yac package in the cwd */
  if (cwd == undefined) cwd = process.cwd();

  const app = express();
  app.use(express.static(path.resolve(__dirname, 'public')))
  app.get('/', (req, res) => res.send('Hello World!'))
  app.get('/yacInfo.json', (req, res) => {
    res.send(JSON.stringify(yacTrack.getInfo()));
  });
  app.listen(port, () => console.log(`Yac dashboard running on port ${port}`));
}

if (require.main === module) {
  module.exports();
}
