const path = require('path');

const isRunning = require('is-running');
const terminate = require('terminate');

const _ = require('lodash');
const yacTrack = require('@yac/track');
const yacExec = require('@yac/exec');

let processes = [];

const setFileLocation = (fileLocation, options) => {
  yacTrack.setFileLocation(fileLocation, options);
}

const getRunningProjects = async (keywordFilter) => {
  // Remove zombie processes:
  processes = await removeZombies(processes);

  // Update the process id's attached to each project
  const info = await yacTrack.getInfo();

  const projects = _.map(info.yacProjects, (project) => {
    let p = _.find(processes, {name: project.name, path: project.path});

    if (keywordFilter != undefined) {
      let pkgJson = require(path.resolve(project.path, 'package.json'));
      if (!_.includes(pkgJson.keywords, keywordFilter)) return undefined;
    }

    if (p != undefined) {
      project.pid = p.pid;
      project.log = p.log;
    }
    return project
  });

  return _.compact(projects);
};

const launchProject = (p, callback) => {
  const LABEL = 'process-management:launchProject';
  try {
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
      proc.log.unshift({err: false, msg: data.toString()});
      callback(proc.log);
    });

    child.stderr.on('data', (data) => {
      proc.log.unshift({err: true, msg: data.toString()});
      callback(proc.log);
    });

    processes.push(proc);
    return child.pid;
  } catch (e) {
    console.error(LABEL, e);
    throw e;
  }
};

const _removeProcess = async (p, info) => {
  if (info == undefined) info = await yacTrack.getInfo();
  const projects = info.yacProjects;
  const project = _.find(projects, {name: p.name, path: p.path});
  project.prevLog = p.log;
  _.remove(processes, {pid: p.pid});
  await yacTrack.writeInfo(info);
}

const terminateProject = async (p) => {
  await _removeProcess(p);
  let err = await new Promise((r,b) => {terminate(p.pid, (e)=>r(e))});
  if (err) throw err;
  return;
};

const removeZombies = async (processes) => {
  /* Remove projects that are no longer running */
  const info = await yacTrack.getInfo();

  await Promise.all(_.map(processes, async (p) => {
    if (!isRunning(p.pid)) {
      // Store the log of the process, and then remove
      await _removeProcess(p, info);
    }
  }));

  return processes;
};

module.exports = {
  getRunningProjects,
  removeZombies,
  launchProject,
  terminateProject,
  setFileLocation
};
