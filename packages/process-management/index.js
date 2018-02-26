const path = require('path');

const isRunning = require('is-running');
const terminate = require('terminate');

const _ = require('lodash');
const yacTrack = require('@yac/track');
const yacExec = require('@yac/exec');

let processes = [];

const getRunningProjects = () => {
  // Remove zombie processes:
  processes = removeZombies(processes);

  // Update the process id's attached to each project
  const info = yacTrack.getInfo();
  const projects = _.map(info.yacProjects, (project) => {
    let p = _.find(processes, {name: project.name, path: project.path});
    if (p != undefined) {
      project.pid = p.pid;
      project.log = p.log;
    }
    return project
  });

  return projects;
};

const launchProject = (p) => {
  const pkgJson = require(path.resolve(p.path, 'package.json'));
  if (pkgJson.main == undefined) throw`
    Yac project missing "main" in package.json.
    path: ${p.path}
    name: ${p.name}
  `;
  const child = yacExec(p.path, pkgJson.main, false, false);
  let proc = _.extend(p, {pid: child.pid});
  proc.log = [];

  child.stdout.on('data', (data) => {
    proc.log.push(data.toString());
    console.log(proc.log);
  });

  child.stderr.on('data', (data) => {
    proc.log.push(data.toString());
    console.log(proc.log);
  });

  processes.push(proc);
  return child.pid
};

const terminateProject = async (p) => {
  console.log("TERMINATING!!");
  _.remove(processes, {pid: p.pid});
  let err = await new Promise((r,b) => {terminate(p.pid, (e)=>r(e))});
  if (err) throw err;
  return;
};

const removeZombies = (processes) => {
  /* Remove projects that are no longer running */
  const info = yacTrack.getInfo();
  const projects = info.yacProjects;

  _.each(processes, (p) => {
    if (!isRunning(p.pid)) {
      // Store the log of the process, and then remove
      const project = _.find(projects, {name: p.name, path: p.path});
      project.prevLog = p.log;
      _.remove(processes, {pid: p.pid});
    }
  });

  // Update project info in yac tracker
  yacTrack.writeInfo(info);

  return processes;
};

module.exports = {
  getRunningProjects, removeZombies, launchProject, terminateProject
};
