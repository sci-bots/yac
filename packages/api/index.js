const init = require('@yac/init');
const install = require('@yac/install');
const exec = require('@yac/exec');
const add = require('@yac/add');
const dev = require('@yac/dev');
const undev = require('@yac/undev');
const remove = require('@yac/remove');
const track = require('@yac/track');
const untrack = require('@yac/untrack');
const list = require('@yac/list');
const dashboard = require('@yac/dashboard');
const autostart = require('@yac/autostart');
const autostartRemove = require('@yac/remove-from-autostart');

module.exports = {
  init,
  install,
  exec,
  add,
  dev,
  undev,
  remove,
  track,
  untrack,
  list,
  dashboard,
  autostart,
  autostartRemove
};
